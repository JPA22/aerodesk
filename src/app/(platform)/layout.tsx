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

  // Fetch profile + seller listing IDs + new leads count in parallel
  const [{ data: profile }, { data: listingIds }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single(),
    supabase
      .from("aircraft_listings")
      .select("id")
      .eq("seller_id", user.id),
  ]);

  let newLeadsCount = 0;
  if (listingIds && listingIds.length > 0) {
    const ids = listingIds.map((l) => l.id);
    const { count } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .in("listing_id", ids)
      .eq("status", "new");
    newLeadsCount = count ?? 0;
  }

  return (
    <PlatformShell
      userName={profile?.full_name ?? user.email ?? "User"}
      userRole={profile?.role ?? "buyer"}
      avatarUrl={profile?.avatar_url ?? null}
      newLeadsCount={newLeadsCount}
    >
      {children}
    </PlatformShell>
  );
}
