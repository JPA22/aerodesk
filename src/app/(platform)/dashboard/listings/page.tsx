import { createClient } from "@/lib/supabase/server";
import ListingsClient from "./listings-client";

export default async function DashboardListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("aircraft_listings")
    .select(
      `id, title, asking_price, currency, status, views_count, created_at,
       sale_price, buyer_name, buyer_email, buyer_phone, sale_notes, sold_at,
       images:listing_images(image_url, is_primary, display_order)`
    )
    .eq("seller_id", user!.id)
    .order("created_at", { ascending: false });

  const listingIds = listings?.map((l) => l.id) ?? [];

  // Count leads dynamically — leads_count column may be stale until triggers backfill
  let countsById: Record<string, number> = {};
  if (listingIds.length > 0) {
    const { data: leadRows } = await supabase
      .from("leads")
      .select("listing_id")
      .in("listing_id", listingIds);

    countsById = (leadRows ?? []).reduce<Record<string, number>>((acc, l) => {
      acc[l.listing_id] = (acc[l.listing_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  const listingsWithCounts = (listings ?? []).map((l) => ({
    ...l,
    leads_count: countsById[l.id] ?? 0,
  }));

  return <ListingsClient listings={listingsWithCounts} />;
}
