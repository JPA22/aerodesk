export type UserRole = "buyer" | "dealer" | "admin";

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;

  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  preferred_language: "pt-BR" | "en";
}
