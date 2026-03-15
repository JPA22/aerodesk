export type DealerPlan = "starter" | "professional" | "enterprise";

export interface Dealer {
  id: string;
  created_at: string;
  updated_at: string;
  profile_id: string;

  company_name: string;
  company_logo_url: string | null;
  website_url: string | null;
  phone: string;
  email: string;

  location_city: string;
  location_state: string;
  location_country: string;

  plan: DealerPlan;
  plan_expires_at: string | null;
  stripe_customer_id: string | null;
  is_verified: boolean;
}
