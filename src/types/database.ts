// Hand-authored types matching 001_initial_schema.sql.
// Regenerate with: npx supabase gen types typescript --project-id tivlfwgsgdnqdxgsmaug

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Enum types
// ---------------------------------------------------------------------------

export type UserRole = "buyer" | "private_seller" | "dealer" | "admin";
export type SubscriptionTier = "basic" | "premium" | "enterprise";
export type SubscriptionStatus = "active" | "trial" | "expired";
export type AircraftCategory = "jet" | "turboprop" | "piston" | "helicopter";
export type EngineProgramStatus = "enrolled" | "not_enrolled" | "na";
export type ListingStatus = "draft" | "active" | "pending_review" | "sold" | "expired";
export type LeadContactMethod = "email" | "phone" | "whatsapp";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed";
export type SearchAlertFrequency = "instant" | "daily" | "weekly";

// ---------------------------------------------------------------------------
// Database shape (Supabase client generic)
// Relationships arrays are required for the JS client's type inference to work.
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: UserRole;
          preferred_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: UserRole;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: UserRole;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      dealer_profiles: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          cnpj: string | null;
          website: string | null;
          description: string | null;
          logo_url: string | null;
          subscription_tier: SubscriptionTier;
          subscription_status: SubscriptionStatus;
          verified: boolean;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          cnpj?: string | null;
          website?: string | null;
          description?: string | null;
          logo_url?: string | null;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          verified?: boolean;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          cnpj?: string | null;
          website?: string | null;
          description?: string | null;
          logo_url?: string | null;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          verified?: boolean;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dealer_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      manufacturers: {
        Row: {
          id: string;
          name: string;
          country: string | null;
          logo_url: string | null;
          aircraft_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country?: string | null;
          logo_url?: string | null;
          aircraft_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string | null;
          logo_url?: string | null;
          aircraft_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      aircraft_models: {
        Row: {
          id: string;
          manufacturer_id: string;
          name: string;
          category: AircraftCategory;
          typical_range_nm: number | null;
          typical_speed_kts: number | null;
          typical_seats: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          manufacturer_id: string;
          name: string;
          category: AircraftCategory;
          typical_range_nm?: number | null;
          typical_speed_kts?: number | null;
          typical_seats?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          manufacturer_id?: string;
          name?: string;
          category?: AircraftCategory;
          typical_range_nm?: number | null;
          typical_speed_kts?: number | null;
          typical_seats?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "aircraft_models_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
        ];
      };

      aircraft_listings: {
        Row: {
          id: string;
          seller_id: string;
          dealer_id: string | null;
          aircraft_model_id: string;
          title: string;
          description: string | null;
          registration_number: string | null;
          year: number;
          serial_number: string | null;
          total_time_hours: number | null;
          engine_time_smoh: number | null;
          asking_price: number;
          currency: string;
          location_city: string | null;
          location_state: string | null;
          location_country: string;
          avionics_description: string | null;
          engine_program: EngineProgramStatus;
          maintenance_status: string | null;
          condition_rating: number | null;
          passenger_seats: number | null;
          galley_config: string | null;
          status: ListingStatus;
          featured: boolean;
          views_count: number;
          leads_count: number;
          published_at: string | null;
          sale_price: number | null;
          buyer_name: string | null;
          buyer_email: string | null;
          buyer_phone: string | null;
          sale_notes: string | null;
          sold_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          dealer_id?: string | null;
          aircraft_model_id: string;
          title: string;
          description?: string | null;
          registration_number?: string | null;
          year: number;
          serial_number?: string | null;
          total_time_hours?: number | null;
          engine_time_smoh?: number | null;
          asking_price: number;
          currency?: string;
          location_city?: string | null;
          location_state?: string | null;
          location_country?: string;
          avionics_description?: string | null;
          engine_program?: EngineProgramStatus;
          maintenance_status?: string | null;
          condition_rating?: number | null;
          passenger_seats?: number | null;
          galley_config?: string | null;
          status?: ListingStatus;
          featured?: boolean;
          views_count?: number;
          leads_count?: number;
          published_at?: string | null;
          sale_price?: number | null;
          buyer_name?: string | null;
          buyer_email?: string | null;
          buyer_phone?: string | null;
          sale_notes?: string | null;
          sold_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          dealer_id?: string | null;
          aircraft_model_id?: string;
          title?: string;
          description?: string | null;
          registration_number?: string | null;
          year?: number;
          serial_number?: string | null;
          total_time_hours?: number | null;
          engine_time_smoh?: number | null;
          asking_price?: number;
          currency?: string;
          location_city?: string | null;
          location_state?: string | null;
          location_country?: string;
          avionics_description?: string | null;
          engine_program?: EngineProgramStatus;
          maintenance_status?: string | null;
          condition_rating?: number | null;
          passenger_seats?: number | null;
          galley_config?: string | null;
          status?: ListingStatus;
          featured?: boolean;
          views_count?: number;
          leads_count?: number;
          published_at?: string | null;
          sale_price?: number | null;
          buyer_name?: string | null;
          buyer_email?: string | null;
          buyer_phone?: string | null;
          sale_notes?: string | null;
          sold_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "aircraft_listings_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "aircraft_listings_dealer_id_fkey";
            columns: ["dealer_id"];
            isOneToOne: false;
            referencedRelation: "dealer_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "aircraft_listings_aircraft_model_id_fkey";
            columns: ["aircraft_model_id"];
            isOneToOne: false;
            referencedRelation: "aircraft_models";
            referencedColumns: ["id"];
          },
        ];
      };

      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          image_url: string;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          image_url: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          image_url?: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "aircraft_listings";
            referencedColumns: ["id"];
          },
        ];
      };

      leads: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          message: string | null;
          contact_method: LeadContactMethod;
          status: LeadStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          message?: string | null;
          contact_method?: LeadContactMethod;
          status?: LeadStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          buyer_id?: string;
          message?: string | null;
          contact_method?: LeadContactMethod;
          status?: LeadStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "aircraft_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      saved_listings: {
        Row: {
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_listings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_listings_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "aircraft_listings";
            referencedColumns: ["id"];
          },
        ];
      };

      search_alerts: {
        Row: {
          id: string;
          user_id: string;
          filters: Json;
          frequency: SearchAlertFrequency;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filters?: Json;
          frequency?: SearchAlertFrequency;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filters?: Json;
          frequency?: SearchAlertFrequency;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "search_alerts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };

    Views: Record<string, never>;

    Functions: Record<string, never>;

    CompositeTypes: Record<string, never>;

    Enums: {
      user_role: UserRole;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      aircraft_category: AircraftCategory;
      engine_program_status: EngineProgramStatus;
      listing_status: ListingStatus;
      lead_contact_method: LeadContactMethod;
      lead_status: LeadStatus;
      search_alert_frequency: SearchAlertFrequency;
    };
  };
};

// ---------------------------------------------------------------------------
// Convenience row-type aliases
// ---------------------------------------------------------------------------

export type Profile         = Database["public"]["Tables"]["profiles"]["Row"];
export type DealerProfile   = Database["public"]["Tables"]["dealer_profiles"]["Row"];
export type Manufacturer    = Database["public"]["Tables"]["manufacturers"]["Row"];
export type AircraftModel   = Database["public"]["Tables"]["aircraft_models"]["Row"];
export type AircraftListing = Database["public"]["Tables"]["aircraft_listings"]["Row"];
export type ListingImage    = Database["public"]["Tables"]["listing_images"]["Row"];
export type Lead            = Database["public"]["Tables"]["leads"]["Row"];
export type SavedListing    = Database["public"]["Tables"]["saved_listings"]["Row"];
export type SearchAlert     = Database["public"]["Tables"]["search_alerts"]["Row"];
