"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Plane, MapPin, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ListingImage {
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface SavedItem {
  listing_id: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    asking_price: number;
    currency: string;
    year: number;
    location_city: string | null;
    location_country: string;
    status: string;
    images: ListingImage[];
  } | null;
}

function getImage(images: ListingImage[]): string | null {
  const primary = images.find((i) => i.is_primary);
  if (primary) return primary.image_url;
  return [...images].sort((a, b) => a.display_order - b.display_order)[0]?.image_url ?? null;
}

export default function SavedClient({ saved }: { saved: SavedItem[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function removeSaved(listingId: string) {
    setRemoving(listingId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("saved_listings")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
    }
    setRemoving(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Saved Aircraft</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Aircraft you&apos;ve saved for later
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Heart size={24} className="text-slate-400" />
          </div>
          <p className="font-semibold text-[#0F172A] mb-1">No saved aircraft</p>
          <p className="text-[#64748B] text-sm mb-6 max-w-xs">
            Browse listings and save your favorites to compare later.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#3B82F6] transition-colors"
          >
            Browse Aircraft
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map(({ listing_id, listing }) => {
            if (!listing) return null;
            const img = getImage(listing.images);
            const isRemoving = removing === listing_id;
            const location = [listing.location_city, listing.location_country]
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={listing_id}
                className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-opacity ${isRemoving ? "opacity-40" : ""}`}
              >
                {/* Image */}
                <div className="relative h-44 bg-slate-100">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Plane size={32} className="text-slate-300" />
                    </div>
                  )}
                  <button
                    onClick={() => void removeSaved(listing_id)}
                    disabled={isRemoving}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 text-slate-500 hover:text-red-500 transition-colors shadow-sm"
                    title="Remove from saved"
                  >
                    <X size={14} />
                  </button>
                  {listing.status !== "active" && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full capitalize">
                      {listing.status}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="font-semibold text-[#0F172A] text-sm hover:text-[#2563EB] transition-colors line-clamp-2 mb-1"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-[#2563EB] font-bold text-base mb-2">
                    {listing.currency} {listing.asking_price.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>{listing.year}</span>
                    {location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> {location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
