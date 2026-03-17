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
      `id, title, asking_price, currency, status, views_count, leads_count, created_at,
       images:listing_images(image_url, is_primary, display_order)`
    )
    .eq("seller_id", user!.id)
    .order("created_at", { ascending: false });

  return <ListingsClient listings={listings ?? []} />;
}
