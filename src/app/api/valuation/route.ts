import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateValuation } from "@/lib/valuation";
import type { Database } from "@/types/database";

// Public Supabase client — reads active listings only (no auth needed)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      model_name?: string;
      manufacturer_name?: string;
      category?: string;
      year?: number;
      total_time_hours?: number | null;
      engine_time_smoh?: number | null;
      condition_rating?: number | null;
      engine_program?: string | null;
    };

    const {
      model_name = "",
      category = "jet",
      year = 2015,
      total_time_hours,
      engine_time_smoh,
      condition_rating,
      engine_program,
    } = body;

    // ── 1. Calculate estimate ──────────────────────────────────────────────
    const result = calculateValuation({
      model_name,
      category,
      year,
      total_time_hours,
      engine_time_smoh,
      condition_rating,
      engine_program,
    });

    // ── 2. Fetch similar active listings (same model or category + year) ───
    // First try: same model name
    let { data: similar } = await supabase
      .from("aircraft_listings")
      .select(
        `id, title, year, asking_price, currency,
         location_city, location_country,
         aircraft_models!aircraft_model_id(name, category),
         listing_images!listing_id(image_url, is_primary, display_order)`
      )
      .eq("status", "active")
      .gte("year", year - 8)
      .lte("year", year + 8)
      .order("featured", { ascending: false })
      .limit(6);

    // Filter to same model if possible, else same category
    const sameModel = (similar ?? []).filter(
      (l: Record<string, unknown>) => {
        const am = l.aircraft_models as { name?: string; category?: string } | null;
        return am?.name === model_name;
      }
    );
    const sameCategory = (similar ?? []).filter(
      (l: Record<string, unknown>) => {
        const am = l.aircraft_models as { name?: string; category?: string } | null;
        return am?.category === category;
      }
    );
    similar = sameModel.length >= 2 ? sameModel.slice(0, 3) : sameCategory.slice(0, 3);

    // ── 3. Upgrade confidence if we have real comparisons ─────────────────
    let confidence = result.confidence;
    if ((similar?.length ?? 0) >= 2) confidence = "high";
    else if ((similar?.length ?? 0) >= 1 && confidence === "medium") confidence = "medium";

    return NextResponse.json({
      ...result,
      confidence,
      similar_listings: similar ?? [],
    });
  } catch (err) {
    console.error("[valuation] error:", err);
    return NextResponse.json(
      { error: "Failed to compute valuation" },
      { status: 500 }
    );
  }
}
