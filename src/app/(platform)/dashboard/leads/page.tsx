import { createClient } from "@/lib/supabase/server";
import LeadsClient from "./leads-client";

export default async function DashboardLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listingIds } = await supabase
    .from("aircraft_listings")
    .select("id")
    .eq("seller_id", user!.id);

  const ids = listingIds?.map((l) => l.id) ?? [];

  if (ids.length === 0) {
    return <LeadsClient leads={[]} />;
  }

  const { data: leads } = await supabase
    .from("leads")
    .select(
      `id, message, contact_method, status, created_at,
       listing:aircraft_listings(id, title, listing_images(image_url, is_primary, display_order)),
       buyer:profiles(full_name, avatar_url)`
    )
    .in("listing_id", ids)
    .order("created_at", { ascending: false });

  return <LeadsClient leads={leads ?? []} />;
}
