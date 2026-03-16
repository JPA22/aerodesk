// Re-export everything from the canonical database types file.
// Thin domain files (listing.ts, dealer.ts, etc.) are superseded by database.ts.
export type {
  Database,
  Json,
  // Enums
  UserRole,
  SubscriptionTier,
  SubscriptionStatus,
  AircraftCategory,
  EngineProgramStatus,
  ListingStatus,
  LeadContactMethod,
  LeadStatus,
  SearchAlertFrequency,
  // Row aliases
  Profile,
  DealerProfile,
  Manufacturer,
  AircraftModel,
  AircraftListing,
  ListingImage,
  Lead,
  SavedListing,
  SearchAlert,
} from "./database";
