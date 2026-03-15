export type AircraftCategory =
  | "single_engine_piston"
  | "multi_engine_piston"
  | "turboprop"
  | "light_jet"
  | "midsize_jet"
  | "heavy_jet"
  | "helicopter"
  | "ultralight";

export type ListingStatus = "draft" | "active" | "under_contract" | "sold" | "expired";

export interface Listing {
  id: string;
  created_at: string;
  updated_at: string;
  dealer_id: string;
  status: ListingStatus;

  // Aircraft details
  year: number;
  make: string;
  model: string;
  registration: string;
  serial_number: string;
  category: AircraftCategory;

  // Performance metrics
  total_time: number | null; // TT — Total Time airframe hours
  engine_1_smoh: number | null; // SMOH — Since Major Overhaul
  engine_2_smoh: number | null;

  // Pricing
  price: number;
  price_currency: "USD" | "BRL";
  price_negotiable: boolean;

  // Location
  location_city: string;
  location_state: string;
  location_country: string;

  // Media
  cover_image_url: string | null;
  image_urls: string[];

  // Description
  title: string;
  description: string | null;
  avionics: string | null;
  modifications: string | null;
}
