import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocumentsClient from "./documents-client";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch listing (verify ownership)
  const { data: listing, error } = await supabase
    .from("aircraft_listings")
    .select(
      `id, title, year, seller_id, dd_tier, dd_score, dd_analysis, dd_analyzed_at,
       aircraft_models!aircraft_model_id (name, category, manufacturers!manufacturer_id (name))`
    )
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();

  if (error || !listing) redirect("/dashboard/listings");

  // Fetch uploaded documents
  const { data: docs } = await supabase
    .from("listing_documents")
    .select("id, category, file_name, file_url, file_size, created_at")
    .eq("listing_id", id)
    .order("category")
    .order("created_at", { ascending: false });

  return (
    <DocumentsClient
      listing={listing as never}
      documents={docs ?? []}
    />
  );
}
