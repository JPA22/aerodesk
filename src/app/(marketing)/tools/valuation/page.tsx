import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import ValuationClient from "./valuation-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Aircraft Valuation | AeroDesk",
  description:
    "Get an instant AI-powered market estimate for any aircraft. Free valuation tool covering jets, turboprops, pistons, and helicopters.",
};

export default async function ValuationPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: manufacturers } = await supabase
    .from("manufacturers")
    .select("id, name")
    .order("name");

  return <ValuationClient manufacturers={manufacturers ?? []} />;
}
