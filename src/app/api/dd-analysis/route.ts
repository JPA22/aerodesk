import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * POST /api/dd-analysis
 *
 * Runs AI-powered Pre-Due Diligence analysis on a listing's uploaded documents.
 * Requires the authenticated user to be the listing's seller.
 *
 * Env: ANTHROPIC_API_KEY
 */

const DOC_CATEGORIES = [
  "airworthiness_certificate",
  "registration_certificate",
  "logbook_airframe",
  "logbook_engine",
  "logbook_propeller",
  "maintenance_records",
  "ad_compliance",
  "insurance_certificate",
  "weight_balance",
  "equipment_list",
  "pre_purchase_inspection",
  "other",
] as const;

// Category importance weights for scoring (critical docs weigh more)
const CATEGORY_WEIGHTS: Record<string, number> = {
  airworthiness_certificate: 15,
  registration_certificate: 12,
  logbook_airframe: 12,
  logbook_engine: 12,
  maintenance_records: 12,
  ad_compliance: 10,
  insurance_certificate: 8,
  weight_balance: 7,
  logbook_propeller: 5,
  equipment_list: 4,
  pre_purchase_inspection: 3,
  other: 0,
};

function tierFromScore(score: number): string {
  if (score >= 80) return "gold";
  if (score >= 50) return "silver";
  if (score >= 20) return "bronze";
  return "none";
}

export async function POST(request: Request) {
  try {
    const { listing_id } = (await request.json()) as { listing_id?: string };
    if (!listing_id) {
      return NextResponse.json({ error: "listing_id required" }, { status: 400 });
    }

    // ── Auth: verify user owns this listing ────────────────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch listing (verify ownership)
    const { data: listing, error: listingErr } = await supabase
      .from("aircraft_listings")
      .select(
        `id, title, year, asking_price, currency, total_time_hours, engine_time_smoh,
         engine_program, condition_rating, maintenance_status, passenger_seats,
         registration_number, serial_number, seller_id,
         aircraft_models!aircraft_model_id (name, category, manufacturers!manufacturer_id (name))`
      )
      .eq("id", listing_id)
      .single();

    if (listingErr || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (listing.seller_id !== user.id) {
      return NextResponse.json({ error: "Not your listing" }, { status: 403 });
    }

    // Fetch uploaded documents
    const { data: docs } = await supabase
      .from("listing_documents")
      .select("id, category, file_name, file_size, created_at")
      .eq("listing_id", listing_id)
      .order("category");

    const documents = docs ?? [];

    if (documents.length === 0) {
      return NextResponse.json({ error: "No documents uploaded" }, { status: 400 });
    }

    // ── Build coverage analysis ────────────────────────────────────────────
    const coveredCategories = [...new Set(documents.map((d) => d.category))];
    const uncoveredCategories = DOC_CATEGORIES.filter(
      (c) => c !== "other" && !coveredCategories.includes(c)
    );

    // Calculate base coverage score from weights
    const maxScore = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    const coveredScore = coveredCategories.reduce(
      (sum, cat) => sum + (CATEGORY_WEIGHTS[cat] ?? 0),
      0
    );
    const coveragePct = Math.round((coveredScore / maxScore) * 100);

    // ── Call Claude API for intelligent analysis ───────────────────────────
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      // Fallback: use coverage-only scoring without AI
      const tier = tierFromScore(coveragePct);
      const analysis = {
        score: coveragePct,
        tier,
        covered: coveredCategories,
        uncovered: uncoveredCategories,
        strengths: coveredCategories.length >= 6
          ? ["Good document coverage across multiple categories"]
          : ["Some documentation provided"],
        gaps: uncoveredCategories.map((c) => c.replace(/_/g, " ")),
        summary: `Coverage-based analysis: ${coveredCategories.length} of ${DOC_CATEGORIES.length - 1} document categories provided.`,
      };

      // Store result
      await supabase
        .from("aircraft_listings")
        .update({
          dd_tier: tier === "none" ? null : tier,
          dd_score: coveragePct,
          dd_analysis: analysis as unknown as Database["public"]["Tables"]["aircraft_listings"]["Update"]["dd_analysis"],
          dd_analyzed_at: new Date().toISOString(),
        })
        .eq("id", listing_id);

      return NextResponse.json(analysis);
    }

    // Build prompt for Claude
    const model = listing.aircraft_models as unknown as { name: string; category: string; manufacturers: { name: string } };
    const docSummary = documents
      .map((d) => `- [${d.category}] ${d.file_name} (${d.file_size ? Math.round(d.file_size / 1024) + " KB" : "unknown size"})`)
      .join("\n");

    const prompt = `You are an aircraft documentation analyst for a pre-due diligence review.

Aircraft: ${listing.year} ${model.manufacturers.name} ${model.name} (${model.category})
Registration: ${listing.registration_number ?? "Not provided"}
Serial: ${listing.serial_number ?? "Not provided"}
Total Time: ${listing.total_time_hours ?? "Not provided"} hours
Engine SMOH: ${listing.engine_time_smoh ?? "Not provided"} hours
Engine Program: ${listing.engine_program}
Condition: ${listing.condition_rating ?? "Not rated"}/10
Maintenance: ${listing.maintenance_status ?? "Not specified"}

Documents uploaded (${documents.length} files across ${coveredCategories.length} categories):
${docSummary}

Missing document categories: ${uncoveredCategories.length > 0 ? uncoveredCategories.join(", ") : "None — all categories covered"}

Based on the document coverage and the aircraft details, provide a Pre-Due Diligence assessment.
Consider: completeness of critical records (airworthiness, registration, logbooks, maintenance), file quality signals (file names, sizes suggest real documents vs placeholders), and relevance to aircraft type.

Respond ONLY with a JSON object (no markdown, no backticks):
{
  "score": <number 0-100>,
  "strengths": [<list of 2-4 strength points>],
  "gaps": [<list of specific missing or weak areas>],
  "summary": "<2-3 sentence overall assessment>"
}`;

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    let aiScore = coveragePct;
    let aiStrengths: string[] = [];
    let aiGaps: string[] = uncoveredCategories.map((c) => c.replace(/_/g, " "));
    let aiSummary = "";

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const text = aiData.content
        ?.filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("");

      try {
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        aiScore = Math.max(0, Math.min(100, parsed.score ?? coveragePct));
        aiStrengths = parsed.strengths ?? [];
        aiGaps = parsed.gaps ?? aiGaps;
        aiSummary = parsed.summary ?? "";
      } catch {
        // AI response parsing failed — use coverage score
        aiSummary = `Coverage-based analysis: ${coveredCategories.length} of ${DOC_CATEGORIES.length - 1} categories provided.`;
      }
    }

    const tier = tierFromScore(aiScore);
    const analysis = {
      score: aiScore,
      tier,
      covered: coveredCategories,
      uncovered: uncoveredCategories,
      strengths: aiStrengths,
      gaps: aiGaps,
      summary: aiSummary,
    };

    // Store result on listing
    await supabase
      .from("aircraft_listings")
      .update({
        dd_tier: tier === "none" ? null : tier,
        dd_score: aiScore,
        dd_analysis: analysis as unknown as Database["public"]["Tables"]["aircraft_listings"]["Update"]["dd_analysis"],
        dd_analyzed_at: new Date().toISOString(),
      })
      .eq("id", listing_id);

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[dd-analysis] error:", err);
    return NextResponse.json(
      { error: "Internal error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
