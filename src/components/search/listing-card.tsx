"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

// ── Shared type (used by search page + detail page similar listings) ──────────

export type ListingCardData = {
  id: string;
  title: string;
  year: number;
  asking_price: number;
  currency: string;
  location_city: string | null;
  location_state: string | null;
  location_country: string;
  total_time_hours: number | null;
  engine_program: string;
  condition_rating: number | null;
  featured: boolean;
  aircraft_models: {
    name: string;
    category: string;
    manufacturers: { name: string };
  };
  listing_images: Array<{
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }>;
};

const ENGINE_LABEL: Record<string, string> = {
  enrolled: "Engine enrolled",
  not_enrolled: "Not enrolled",
  na: "N/A",
};

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", BRL: "R$", EUR: "€" };

function PlanePlaceholder() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0F172A] to-[#2563EB] flex items-center justify-center">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:20px_20px]" />
      <svg className="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 64 64">
        <path d="M56 24l-12 4-14-18H24l6 18-12 4-6-6H8l4 10-4 10h4l6-6 12 4-6 18h6l14-18 12 4c4 0 8-2 8-6s-4-6-8-8z" />
      </svg>
    </div>
  );
}

export default function ListingCard({
  listing,
  savedIds = new Set(),
  onSaveChange,
}: {
  listing: ListingCardData;
  savedIds?: Set<string>;
  onSaveChange?: (id: string, saved: boolean) => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const isSaved = savedIds.has(listing.id);

  const primaryImage =
    listing.listing_images.find((i) => i.is_primary)?.image_url ??
    listing.listing_images.sort((a, b) => a.display_order - b.display_order)[0]?.image_url;

  const sym = CURRENCY_SYMBOL[listing.currency] ?? "$";
  const priceDisplay =
    listing.asking_price === 0
      ? "Price on Request"
      : `${sym} ${listing.asking_price.toLocaleString("en-US")}`;

  const location = [listing.location_city, listing.location_state, listing.location_country]
    .filter(Boolean)
    .join(", ");

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listing.id);
        onSaveChange?.(listing.id, false);
      } else {
        await supabase
          .from("saved_listings")
          .insert({ user_id: user.id, listing_id: listing.id });
        onSaveChange?.(listing.id, true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="group bg-white rounded-xl shadow-sm shadow-slate-200 border border-slate-100 overflow-hidden"
    >
      <Link href={`/listings/${listing.id}`} className="block">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <PlanePlaceholder />
          )}
          {listing.featured && (
            <span className="absolute top-2.5 left-2.5 bg-[#2563EB] text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
              <Star size={10} className="fill-white" /> Featured
            </span>
          )}
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            title={isSaved ? "Remove from saved" : "Save listing"}
          >
            <Heart
              size={15}
              className={isSaved ? "fill-red-500 text-red-500" : "text-slate-400"}
            />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-xs text-[#64748B] mb-1 font-medium">
            {listing.aircraft_models.manufacturers.name} · {listing.aircraft_models.category}
          </p>
          <h3 className="font-bold text-[#0F172A] text-sm mb-3 leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-2">
            {listing.title}
          </h3>

          {/* Specs row */}
          <div className="flex items-center gap-3 text-xs text-[#64748B] mb-3">
            {listing.total_time_hours != null && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {listing.total_time_hours.toLocaleString()} hrs TT
              </span>
            )}
            {listing.engine_program && listing.engine_program !== "na" && (
              <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-medium">
                {ENGINE_LABEL[listing.engine_program]}
              </span>
            )}
          </div>

          <div className="flex items-end justify-between">
            <span
              className={`font-bold text-base ${
                listing.asking_price === 0 ? "text-[#64748B] text-sm" : "text-[#2563EB]"
              }`}
            >
              {priceDisplay}
            </span>
            <span className="text-[#64748B] text-xs flex items-center gap-1">
              <MapPin size={11} />
              <span className="truncate max-w-[120px]">{location}</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
