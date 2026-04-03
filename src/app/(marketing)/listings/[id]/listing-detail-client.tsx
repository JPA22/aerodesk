"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Clock, Gauge, Shield, Users, ChevronLeft,
  ChevronRight, X, Heart, Share2, MessageCircle, CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import ContactModal from "@/components/search/contact-modal";
import ListingCard, { type ListingCardData } from "@/components/search/listing-card";
import { formatPrice, fmtNum } from "@/lib/format";
import { fmtVal, priceBadge, pricePosition, type ValuationResult } from "@/lib/valuation";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";

// ── Types ─────────────────────────────────────────────────────────────────────

type Image = { image_url: string; is_primary: boolean; display_order: number };

type ListingDetail = {
  id: string;
  title: string;
  year: number;
  asking_price: number;
  currency: string;
  description: string | null;
  serial_number: string | null;
  registration_number: string | null;
  total_time_hours: number | null;
  engine_time_smoh: number | null;
  engine_program: string;
  avionics_description: string | null;
  condition_rating: number | null;
  maintenance_status: string | null;
  passenger_seats: number | null;
  galley_config: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string;
  featured: boolean;
  wifi_equipped: boolean;
  apu_equipped: boolean;
  aircraft_models: {
    id: string;
    name: string;
    category: string;
    typical_range_nm: number | null;
    typical_speed_kts: number | null;
    typical_seats: number | null;
    cabin_length_ft: number | null;
    cabin_width_ft: number | null;
    cabin_height_ft: number | null;
    baggage_volume_cuft: number | null;
    cruise_speed_kts: number | null;
    max_altitude_ft: number | null;
    pressurized: boolean;
    num_engines: number;
    mtow_lbs: number | null;
    useful_load_lbs: number | null;
    manufacturers: { id: string; name: string };
  };
  listing_images: Image[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", BRL: "R$", EUR: "€" };

// Label maps are now inside the component to use translations

// ── Image Gallery ─────────────────────────────────────────────────────────────

function ImageGallery({ images }: { images: Image[] }) {
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const prev = () =>
    setLightboxIdx((i) => (i != null ? (i - 1 + sorted.length) % sorted.length : null));
  const next = () =>
    setLightboxIdx((i) => (i != null ? (i + 1) % sorted.length : null));

  useEffect(() => {
    if (lightboxIdx == null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightboxIdx(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (sorted.length === 0) {
    return (
      <div className="relative w-full h-72 md:h-96 bg-gradient-to-br from-[#0F172A] to-[#2563EB] rounded-2xl flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:24px_24px]" />
        <svg className="w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 64 64">
          <path d="M56 24l-12 4-14-18H24l6 18-12 4-6-6H8l4 10-4 10h4l6-6 12 4-6 18h6l14-18 12 4c4 0 8-2 8-6s-4-6-8-8z" />
        </svg>
        <p className="absolute bottom-4 text-white/50 text-sm">{/* No photos */}</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div
        className={`grid gap-2 rounded-2xl overflow-hidden ${
          sorted.length === 1
            ? "grid-cols-1"
            : sorted.length === 2
            ? "grid-cols-2"
            : sorted.length === 3
            ? "grid-cols-2 grid-rows-2"
            : "grid-cols-3 grid-rows-2"
        }`}
      >
        {sorted.slice(0, sorted.length === 3 ? 3 : 5).map((img, idx) => (
          <div
            key={idx}
            className={`relative cursor-pointer overflow-hidden bg-slate-100 ${
              idx === 0 && sorted.length > 2 ? "row-span-2" : ""
            } ${sorted.length === 1 ? "h-72 md:h-[460px]" : "h-40 md:h-52"}`}
            onClick={() => setLightboxIdx(idx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.image_url}
              alt={`Photo ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {idx === 4 && sorted.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{sorted.length - 5} more</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx != null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
          >
            <X size={24} />
          </button>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
          >
            <ChevronRight size={32} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sorted[lightboxIdx].image_url}
            alt={`Photo ${lightboxIdx + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightboxIdx + 1} / {sorted.length}
          </p>
        </div>
      )}
    </>
  );
}

// ── ViewCounter (increments on mount) ─────────────────────────────────────────

function ViewCounter({ listingId }: { listingId: string }) {
  const supabase = createClient();
  useEffect(() => {
    const increment = async () => {
      const { error } = await (supabase.rpc as Function)("increment_views", { listing_id: listingId });
      if (error) {
        // Fallback: direct update if RPC doesn't exist
        const { data } = await supabase
          .from("aircraft_listings")
          .select("views_count")
          .eq("id", listingId)
          .single();
        if (data) {
          await supabase
            .from("aircraft_listings")
            .update({ views_count: (data.views_count ?? 0) + 1 })
            .eq("id", listingId);
        }
      }
    };
    void increment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);
  return null;
}

// ── Spec row ──────────────────────────────────────────────────────────────────

function Spec({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-b border-slate-100 last:border-0 gap-1">
      <span className="text-sm text-[#64748B]">{label}</span>
      <span className="text-sm font-medium text-[#0F172A] sm:text-right">{value}</span>
    </div>
  );
}

// ── Valuation Card ────────────────────────────────────────────────────────────

function ValuationCard({
  listing,
  modelName,
  category,
}: {
  listing: ListingDetail;
  modelName: string;
  category: string;
}) {
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useTranslation();

  useEffect(() => {
    fetch("/api/valuation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model_name: modelName,
        category,
        year: listing.year,
        total_time_hours: listing.total_time_hours,
        engine_time_smoh: listing.engine_time_smoh,
        condition_rating: listing.condition_rating,
        engine_program: listing.engine_program,
      }),
    })
      .then((r) => r.json())
      .then((data: ValuationResult) => setValuation(data))
      .catch(() => null)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.id]);

  if (loading) {
    return (
      <div className="mb-5 rounded-xl bg-slate-50 border border-slate-100 p-3 animate-pulse">
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
        <div className="h-2 bg-slate-200 rounded mb-2" />
        <div className="h-2 bg-slate-200 rounded w-3/4" />
      </div>
    );
  }

  if (!valuation) return null;

  const showAskingBar = listing.asking_price > 0;
  const pos = showAskingBar
    ? pricePosition(listing.asking_price, valuation.low, valuation.high)
    : null;
  const badge = showAskingBar ? priceBadge(listing.asking_price, valuation.mid) : null;

  return (
    <div className="mb-5 rounded-xl bg-slate-50 border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
          <BarChart3 size={13} className="text-[#2563EB]" />
          {t.listing.aerodeskEstimate}
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Value range numbers */}
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[#64748B]">{fmtVal(valuation.low, locale)}</span>
        <span className="font-bold text-[#0F172A]">{fmtVal(valuation.mid, locale)}</span>
        <span className="text-[#64748B]">{fmtVal(valuation.high, locale)}</span>
      </div>

      {/* Gradient bar */}
      <div className="relative h-2 rounded-full overflow-visible mb-1">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-200 via-[#2563EB] to-slate-200" />
        {pos !== null && (
          <div
            className="absolute top-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#0F172A] shadow z-10"
            style={{ left: `${pos}%`, transform: "translate(-50%, -50%)" }}
          />
        )}
      </div>

      <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1">
        <span>{t.valuation.low}</span>
        <span>Mid</span>
        <span>{t.valuation.high}</span>
      </div>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

export default function ListingDetailClient({
  listing,
  similar,
}: {
  listing: ListingDetail;
  similar: ListingCardData[];
}) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { t, locale } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const ENGINE_LABEL: Record<string, string> = {
    enrolled: t.listing.enrolled, not_enrolled: t.listing.notEnrolled, na: t.listing.engineNA,
  };
  const MAINTENANCE_LABEL: Record<string, string> = {
    annual_current: t.listing.maintAnnualCurrent, inspection_due_3mo: t.listing.maintDue3mo,
    inspection_due_6mo: t.listing.maintDue6mo, needs_inspection: t.listing.maintNeedsInspection,
    fresh_overhaul: t.listing.maintFreshOverhaul,
  };
  const CONDITION_LABEL: Record<number, string> = {
    1: t.listing.condProject, 2: t.listing.condPoor, 3: t.listing.condFair, 4: t.listing.condBelowAvg,
    5: t.listing.condGood, 6: t.listing.condVeryGood, 7: t.listing.condAboveAvg,
    8: t.listing.condExcellent, 9: t.listing.condShowQuality, 10: t.listing.condLikeNew,
  };
  const GALLEY_LABEL: Record<string, string> = {
    none: t.listing.galleyNone, forward: t.listing.galleyForward, aft: t.listing.galleyAft, both: t.listing.galleyBoth,
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const model = listing.aircraft_models;
  const priceDisplay = formatPrice(listing.asking_price, listing.currency, locale);

  const location = [listing.location_city, listing.location_state, listing.location_country]
    .filter(Boolean)
    .join(", ");

  // Check if saved
  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_listings")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", listing.id)
      .maybeSingle()
      .then(({ data }) => setIsSaved(!!data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, listing.id]);

  const toggleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (isSaved) {
      const { error } = await supabase
        .from("saved_listings")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listing.id);
      if (error) {
        alert(`Failed to unsave: ${error.message} (code: ${error.code})`);
        return;
      }
    } else {
      const { error } = await supabase
        .from("saved_listings")
        .insert({ user_id: user.id, listing_id: listing.id });
      if (error) {
        alert(`Failed to save: ${error.message} (code: ${error.code})`);
        return;
      }
    }
    // Re-verify state from database
    const { data } = await supabase
      .from("saved_listings")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", listing.id)
      .maybeSingle();
    const nowSaved = !!data;
    setIsSaved(nowSaved);
    if (nowSaved) showToast(t.listing.aircraftSaved);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Success toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[70] bg-green-600 text-white font-semibold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm whitespace-nowrap">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      {/* Increment view count silently */}
      <ViewCounter listingId={listing.id} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#64748B] mb-6 flex items-center gap-1.5">
          <a href="/search" className="hover:text-[#2563EB] transition-colors">{t.listing.breadcrumbAircraft}</a>
          <span>/</span>
          <span className="capitalize">{model.category}s</span>
          <span>/</span>
          <span className="text-[#0F172A] font-medium truncate">{listing.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: gallery + details */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Gallery */}
            <ImageGallery images={listing.listing_images} />

            {/* Title block (mobile) */}
            <div className="lg:hidden bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">
                {model.manufacturers.name} · {model.category}
              </p>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-2">{listing.title}</h1>
              <div className="flex items-center gap-1.5 text-[#64748B] text-sm">
                <MapPin size={14} />
                {location}
              </div>
              <p
                className={`text-2xl font-bold mt-3 ${
                  listing.asking_price === 0 ? "text-[#64748B] text-lg" : "text-[#2563EB]"
                }`}
              >
                {priceDisplay}
              </p>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-[#0F172A] mb-5 text-lg">{t.listing.specs}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <Spec label={t.listing.year} value={listing.year} />
                  <Spec label={t.listing.manufacturer} value={model.manufacturers.name} />
                  <Spec label={t.listing.model} value={model.name} />
                  <Spec label={t.listing.registration} value={listing.registration_number} />
                  <Spec label={t.listing.serialNumber} value={listing.serial_number} />
                  <Spec label={t.listing.passengerSeats} value={listing.passenger_seats} />
                  <Spec
                    label={t.listing.galley}
                    value={listing.galley_config ? GALLEY_LABEL[listing.galley_config] : undefined}
                  />
                </div>
                <div>
                  <Spec
                    label={t.listing.totalTime}
                    value={
                      listing.total_time_hours != null
                        ? `${fmtNum(listing.total_time_hours, locale)} hrs`
                        : undefined
                    }
                  />
                  <Spec
                    label={t.listing.engineSmoh}
                    value={
                      listing.engine_time_smoh != null
                        ? `${fmtNum(listing.engine_time_smoh, locale)} hrs`
                        : undefined
                    }
                  />
                  <Spec
                    label={t.listing.engineProgram}
                    value={ENGINE_LABEL[listing.engine_program ?? "na"]}
                  />
                  <Spec
                    label={t.listing.condition}
                    value={
                      listing.condition_rating != null
                        ? `${listing.condition_rating}/10 — ${CONDITION_LABEL[listing.condition_rating]}`
                        : undefined
                    }
                  />
                  <Spec
                    label={t.listing.maintenance}
                    value={MAINTENANCE_LABEL[listing.maintenance_status ?? ""] ?? listing.maintenance_status}
                  />
                  <Spec
                    label={t.listing.location}
                    value={location}
                  />
                </div>
              </div>

              {/* Performance & Cabin */}
              {(model.typical_range_nm || model.cruise_speed_kts || model.typical_speed_kts || model.max_altitude_ft || model.cabin_length_ft || model.baggage_volume_cuft || model.mtow_lbs || model.num_engines > 1 || model.pressurized) && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">{t.listing.performance}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <div>
                      <Spec
                        label={t.listing.range}
                        value={model.typical_range_nm != null ? `${fmtNum(model.typical_range_nm, locale)} nm` : undefined}
                      />
                      <Spec
                        label={t.listing.cruiseSpeed}
                        value={
                          (model.cruise_speed_kts ?? model.typical_speed_kts) != null
                            ? `${fmtNum((model.cruise_speed_kts ?? model.typical_speed_kts)!, locale)} kts`
                            : undefined
                        }
                      />
                      <Spec
                        label={t.listing.maxAltitude}
                        value={model.max_altitude_ft != null ? `${fmtNum(model.max_altitude_ft, locale)} ft` : undefined}
                      />
                      <Spec label={t.listing.pressurized} value={model.pressurized ? t.listing.yes : t.listing.no} />
                      <Spec label={t.listing.engines} value={model.num_engines > 0 ? model.num_engines : undefined} />
                    </div>
                    <div>
                      <Spec
                        label={t.listing.cabinDimensions}
                        value={
                          model.cabin_length_ft != null
                            ? `${model.cabin_length_ft} × ${model.cabin_width_ft ?? "—"} × ${model.cabin_height_ft ?? "—"} ft`
                            : undefined
                        }
                      />
                      <Spec
                        label={t.listing.baggageVolume}
                        value={model.baggage_volume_cuft != null ? `${model.baggage_volume_cuft} cu ft` : undefined}
                      />
                      <Spec
                        label={t.listing.mtow}
                        value={model.mtow_lbs != null ? `${fmtNum(model.mtow_lbs, locale)} lbs` : undefined}
                      />
                      <Spec
                        label={t.listing.usefulLoad}
                        value={model.useful_load_lbs != null ? `${fmtNum(model.useful_load_lbs, locale)} lbs` : undefined}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Equipment */}
              {(listing.wifi_equipped || listing.apu_equipped) && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">{t.listing.equipment}</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.wifi_equipped && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#2563EB] text-xs font-medium px-3 py-1.5 rounded-full">
                        <CheckCircle size={12} /> WiFi
                      </span>
                    )}
                    {listing.apu_equipped && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#2563EB] text-xs font-medium px-3 py-1.5 rounded-full">
                        <CheckCircle size={12} /> APU
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Avionics */}
              {listing.avionics_description && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-sm text-[#64748B] mb-1.5">{t.listing.avionics}</p>
                  <p className="text-sm text-[#0F172A] leading-relaxed">{listing.avionics_description}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-[#0F172A] mb-4 text-lg">{t.listing.description}</h2>
                <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: sticky sidebar (desktop) */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <p className="text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">
                {model.manufacturers.name} · {model.category}
              </p>
              <h1 className="text-xl font-bold text-[#0F172A] mb-1 leading-snug">
                {listing.title}
              </h1>
              <div className="flex items-center gap-1 text-[#64748B] text-sm mb-4">
                <MapPin size={13} />
                {location}
              </div>

              <p
                className={`text-3xl font-bold mb-6 ${
                  listing.asking_price === 0 ? "text-[#64748B] text-xl" : "text-[#2563EB]"
                }`}
              >
                {priceDisplay}
              </p>

              {/* Key specs mini */}
              <div className="flex gap-3 mb-6">
                {listing.total_time_hours != null && (
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                    <Clock size={16} className="text-[#2563EB] mx-auto mb-1" />
                    <p className="text-xs font-bold text-[#0F172A]">
                      {fmtNum(listing.total_time_hours, locale)}
                    </p>
                    <p className="text-[10px] text-[#64748B]">{t.listing.hrsTT}</p>
                  </div>
                )}
                {listing.condition_rating != null && (
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                    <Gauge size={16} className="text-[#2563EB] mx-auto mb-1" />
                    <p className="text-xs font-bold text-[#0F172A]">{listing.condition_rating}/10</p>
                    <p className="text-[10px] text-[#64748B]">{t.listing.condition}</p>
                  </div>
                )}
                {listing.engine_program && listing.engine_program !== "na" && (
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                    <Shield size={16} className="text-[#2563EB] mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-[#0F172A]">
                      {listing.engine_program === "enrolled" ? t.listing.enrolled : t.listing.notEnrolled}
                    </p>
                    <p className="text-[10px] text-[#64748B]">{t.listing.engineProgram}</p>
                  </div>
                )}
              </div>

              {/* AeroDesk Estimate */}
              <ValuationCard
                listing={listing}
                modelName={model.name}
                category={model.category}
              />

              {/* CTA buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setContactOpen(true)}
                  className="w-full bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                >
                  <MessageCircle size={18} />
                  {t.listing.contactSeller}
                </button>

                <button
                  onClick={() => {
                    const msg = encodeURIComponent(
                      `Hi, I'm interested in the ${listing.year} ${model.manufacturers.name} ${model.name}. Could you please provide more details? Listing: ${window.location.href}`
                    );
                    window.open(`https://wa.me/5511918557770?text=${msg}`, "_blank");
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#1EBF5A] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle size={18} />
                  {t.listing.contactWhatsApp}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={toggleSave}
                    className={`flex-1 border-2 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-colors ${
                      isSaved
                        ? "border-red-200 bg-red-50 text-red-500"
                        : "border-slate-200 hover:border-slate-300 text-[#64748B]"
                    }`}
                  >
                    <Heart size={16} className={isSaved ? "fill-red-500" : ""} />
                    {isSaved ? t.listing.saved : t.listing.save}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 border-2 border-slate-200 hover:border-slate-300 text-[#64748B] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-colors"
                  >
                    <Share2 size={16} />
                    {copied ? t.listing.copied : t.listing.share}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">{t.listing.similarAircraft}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3 lg:hidden z-20">
        <div className="flex-1">
          <p
            className={`font-bold text-lg ${
              listing.asking_price === 0 ? "text-[#64748B] text-base" : "text-[#2563EB]"
            }`}
          >
            {priceDisplay}
          </p>
        </div>
        <button
          onClick={handleShare}
          className="border-2 border-slate-200 text-[#64748B] p-3 rounded-xl"
        >
          <Share2 size={18} />
        </button>
        <button
          onClick={toggleSave}
          className={`border-2 p-3 rounded-xl ${
            isSaved ? "border-red-200 text-red-500" : "border-slate-200 text-[#64748B]"
          }`}
        >
          <Heart size={18} className={isSaved ? "fill-red-500" : ""} />
        </button>
        <button
          onClick={() => setContactOpen(true)}
          className="bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
        >
          <Users size={18} />
          {t.listing.contact}
        </button>
      </div>

      {/* Contact modal */}
      {contactOpen && (
        <ContactModal
          listingId={listing.id}
          listingTitle={listing.title}
          onClose={() => setContactOpen(false)}
          onSuccess={() => showToast(t.listing.inquirySent)}
        />
      )}
    </div>
  );
}
