import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlatformShell from "@/components/layout/platform-shell";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile for the shell
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  return (
    <PlatformShell
      userName={profile?.full_name ?? user.email ?? "User"}
      userRole={profile?.role ?? "buyer"}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </PlatformShell>
  );
}
