export type LeadStatus = "new" | "contacted" | "qualified" | "closed_won" | "closed_lost";

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  listing_id: string;
  dealer_id: string;

  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: LeadStatus;

  // PPI = Pre-Purchase Inspection interest
  ppi_requested: boolean;
}
