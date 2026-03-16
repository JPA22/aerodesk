import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

// ── Zod schema (shared across all steps) ─────────────────────────────────────

export const wizardSchema = z.object({
  // Step 1 — Aircraft Type
  category: z.enum(["jet", "turboprop", "piston", "helicopter"] as const),
  manufacturer_id: z.string().min(1, "Select a manufacturer"),
  aircraft_model_id: z.string().optional(),
  custom_model_name: z.string().optional(),

  // Step 2 — Aircraft Details
  year: z
    .number({ error: "Enter a valid year" })
    .int()
    .min(1950, "Year must be 1950 or later")
    .max(2026, "Year cannot be in the future"),
  serial_number: z.string().optional(),
  registration_number: z.string().optional(),
  total_time_hours: z.string().optional(), // coerced to number at submit
  engine_time_smoh: z.string().optional(),
  engine_program: z.enum(["enrolled", "not_enrolled", "na"] as const),
  avionics_description: z.string().optional(),
  passenger_seats: z.string().optional(),
  galley_config: z.string().optional(),

  // Step 3 — Condition & Pricing
  condition_rating: z.number().int().min(1).max(10),
  maintenance_status: z.string().min(1, "Select a maintenance status"),
  has_damage_history: z.boolean(),
  damage_description: z.string().optional(),
  price_on_request: z.boolean(),
  asking_price: z.string().optional(),
  currency: z.enum(["USD", "BRL", "EUR"] as const),
  price_negotiable: z.boolean(),

  // Step 5 — Location & Contact
  location_country: z.string().min(1, "Select a country"),
  location_state: z.string().min(1, "Select a state"),
  location_city: z.string().min(1, "Enter a city"),
  contact_email: z.boolean(),
  contact_phone: z.boolean(),
  contact_whatsapp: z.boolean(),
  phone: z.string().optional(),
  additional_notes: z.string().optional(),
});

export type WizardData = z.infer<typeof wizardSchema>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WizardForm = UseFormReturn<WizardData, any, WizardData>;

// ── Image state (managed outside RHF — Files can't be serialised) ─────────────

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

// ── Per-step field lists (for targeted validation on Next) ────────────────────

export const STEP_FIELDS: Record<number, (keyof WizardData)[]> = {
  1: ["category", "manufacturer_id"],
  2: ["year"],
  3: ["condition_rating", "maintenance_status"],
  4: [],
  5: ["location_country", "location_state", "location_city"],
  6: [],
};

// ── Default values ────────────────────────────────────────────────────────────

export const WIZARD_DEFAULTS: Partial<WizardData> = {
  engine_program: "na",
  condition_rating: 5,
  has_damage_history: false,
  price_on_request: false,
  currency: "USD",
  price_negotiable: false,
  location_country: "Brazil",
  contact_email: true,
  contact_phone: false,
  contact_whatsapp: false,
};

export const WIZARD_STORAGE_KEY = "aerodesk_listing_wizard_v1";
