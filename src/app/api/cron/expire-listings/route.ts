import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * GET /api/cron/expire-listings
 *
 * Auto-expires active listings whose refreshed_at (or published_at fallback)
 * is older than 90 days. Intended to be called by a Vercel Cron job daily.
 *
 * Requires env vars:
 *   SUPABASE_SERVICE_ROLE_KEY – service role key (bypasses RLS)
 *   CRON_SECRET              – shared secret for authorization
 *
 * Add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/expire-listings", "schedule": "0 6 * * *" }] }
 */

export async function GET(request: Request) {
  // ── Auth check ───────────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Supabase admin client ────────────────────────────────────────────────
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  // ── Find active listings older than 90 days ──────────────────────────────
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  // Expire listings where refreshed_at < cutoff (if set), OR
  // refreshed_at is null AND published_at < cutoff
  const { data: expired, error: fetchErr } = await supabase
    .from("aircraft_listings")
    .select("id, title, refreshed_at, published_at")
    .eq("status", "active")
    .or(`refreshed_at.lt.${cutoff},and(refreshed_at.is.null,published_at.lt.${cutoff})`);

  if (fetchErr) {
    return NextResponse.json(
      { error: "Failed to query listings", details: fetchErr.message },
      { status: 500 }
    );
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ expired: 0, message: "No listings to expire" });
  }

  // ── Batch update ─────────────────────────────────────────────────────────
  const ids = expired.map((l) => l.id);

  const { error: updateErr } = await supabase
    .from("aircraft_listings")
    .update({ status: "expired" })
    .in("id", ids);

  if (updateErr) {
    return NextResponse.json(
      { error: "Failed to update listings", details: updateErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    expired: ids.length,
    ids,
    cutoff_date: cutoff,
    message: `Expired ${ids.length} listing(s)`,
  });
}
