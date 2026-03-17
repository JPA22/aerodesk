import { createClient } from "@/lib/supabase/server";
import SavedClient from "./saved-client";

export default async function DashboardSavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: saved } = await supabase
    .from("saved_listings")
    .select(
      `listing_id, created_at,
       listing:aircraft_listings(
         id, title, asking_price, currency, year,
         location_city, location_country, status,
         images:listing_images(image_url, is_primary, display_order)
       )`
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <SavedClient saved={saved ?? []} />;
}
