import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import type { AircraftListing } from "@/types/database";
import ListingDetailClient from "./listing-detail-client";

type ListingRow = AircraftListing & {
  aircraft_models: { id: string; name: string; category: string; manufacturers: { id: string; name: string } };
  listing_images: Array<{ image_url: string; is_primary: boolean; display_order: number }>;
};

// ── Server-side data fetch ────────────────────────────────────────────────────

async function getListing(id: string) {
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

  const { data, error } = await supabase
    .from("aircraft_listings")
    .select(
      `*,
       aircraft_models!aircraft_model_id (
         id, name, category, typical_range_nm, typical_speed_kts, typical_seats,
         cabin_length_ft, cabin_width_ft, cabin_height_ft, baggage_volume_cuft,
         cruise_speed_kts, max_altitude_ft, pressurized, num_engines,
         mtow_lbs, useful_load_lbs,
         manufacturers!manufacturer_id (id, name)
       ),
       listing_images!listing_id (image_url, is_primary, display_order)`
    )
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !data) return null;
  return data as unknown as ListingRow;
}

async function getSimilarListings(id: string, modelId: string, category: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
    }
  );

  const { data } = await supabase
    .from("aircraft_listings")
    .select(
      `id, title, year, asking_price, currency,
       location_city, location_state, location_country,
       total_time_hours, engine_program, condition_rating, featured, published_at, refreshed_at, dd_tier,
       aircraft_models!aircraft_model_id (id, name, category, manufacturer_id, manufacturers!manufacturer_id (id, name)),
       listing_images!listing_id (image_url, is_primary, display_order)`
    )
    .eq("status", "active")
    .neq("id", id)
    .eq("aircraft_models.category", category as never)
    .order("featured", { ascending: false })
    .limit(4);

  return data ?? [];
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Listing not found | AeroDesk" };

  const model = listing.aircraft_models;

  const title = `${listing.title} for Sale | AeroDesk`;
  const description =
    listing.description ||
    `${listing.year} ${model.manufacturers.name} ${model.name} for sale. ${
      listing.asking_price === 0 ? "Price on request." : `Asking price: $${listing.asking_price.toLocaleString()}.`
    } Located in ${listing.location_country}.`;

  const primaryImage = listing.listing_images.find((i) => i.is_primary)?.image_url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: primaryImage ? [{ url: primaryImage }] : [],
      type: "website",
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const model = listing.aircraft_models;
  const similar = await getSimilarListings(id, model.id, model.category);

  return (
    <ListingDetailClient
      listing={listing as never}
      similar={similar as never}
    />
  );
}
