import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./settings-client";

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: dealerProfile }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, avatar_url, role")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("dealer_profiles")
      .select("company_name, cnpj, website, description, logo_url")
      .eq("user_id", user!.id)
      .single(),
  ]);

  return (
    <SettingsClient
      userId={user!.id}
      email={user!.email ?? ""}
      profile={{
        full_name: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
        avatar_url: profile?.avatar_url ?? null,
        role: profile?.role ?? "buyer",
      }}
      dealerProfile={
        dealerProfile
          ? {
              company_name: dealerProfile.company_name ?? "",
              cnpj: dealerProfile.cnpj ?? "",
              website: dealerProfile.website ?? "",
              description: dealerProfile.description ?? "",
              logo_url: dealerProfile.logo_url ?? null,
            }
          : null
      }
    />
  );
}
