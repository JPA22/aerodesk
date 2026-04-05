"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Manufacturer } from "@/types/database";
import ListingCard, { type ListingCardData } from "@/components/search/listing-card";
import { useTranslation } from "@/components/providers/language-provider";
import { formatPriceCompact, fmtNum } from "@/lib/format";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;
const MIN_YEAR = 1970;
const MAX_YEAR = 2026;
const MAX_PRICE = 50_000_000;
const PRICE_STEP = 50_000;

// Categories and sort options are now inside components to use translations

// ── Dual-range slider ─────────────────────────────────────────────────────────

function DualSlider({
  min, max, step = 1, value, onChange, format,
}: {
  min: number; max: number; step?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  format?: (v: number) => string;
}) {
  const [lo, hi] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="pt-1 pb-6">
      <div className="relative h-1 bg-slate-200 rounded mx-1">
        {/* Colored track between thumbs */}
        <div
          className="absolute h-full bg-[#2563EB] rounded"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
          ref={trackRef}
        />
      </div>
      {/* Two overlapping range inputs */}
      <div className="relative h-1 -mt-1">
        <input
          type="range" min={min} max={max} step={step} value={lo}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), hi - step);
            onChange([v, hi]);
          }}
          className="range-airplane absolute w-full"
          style={{ zIndex: lo > max * 0.9 ? 5 : 3 }}
        />
        <input
          type="range" min={min} max={max} step={step} value={hi}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), lo + step);
            onChange([lo, v]);
          }}
          className="range-airplane absolute w-full"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between mt-5 text-xs text-[#64748B]">
        <span>{format ? format(lo) : lo}</span>
        <span>{format ? format(hi) : hi}{hi >= max ? "+" : ""}</span>
      </div>
    </div>
  );
}

// ── Formatted number input for filters ────────────────────────────────────────

function FilterNumberInput({
  value,
  onChange,
  placeholder,
  suffix,
  locale,
  className = "",
}: {
  value: string;
  onChange: (raw: string | null) => void;
  placeholder: string;
  suffix?: string;
  locale: string;
  className?: string;
}) {
  const jsLocale = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  const display = value ? Number(value).toLocaleString(jsLocale) : "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    onChange(digits || null);
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={display}
        onChange={handleChange}
        className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${suffix ? "pr-12" : ""} ${className}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>
      )}
    </div>
  );
}

// ── Filter sidebar ────────────────────────────────────────────────────────────

function Filters({
  params, manufacturers, onChange, onClear,
}: {
  params: URLSearchParams;
  manufacturers: Manufacturer[];
  onChange: (key: string, value: string | null) => void;
  onClear: () => void;
}) {
  const { t, locale } = useTranslation();
  const [mfgSearch, setMfgSearch] = useState("");
  const [mfgOpen, setMfgOpen] = useState(false);

  const CATEGORIES = [
    { value: "jet", label: t.hero.jets },
    { value: "turboprop", label: t.hero.turboprops },
    { value: "piston", label: t.hero.pistons },
    { value: "helicopter", label: t.hero.helicopters },
  ];

  const COUNTRIES = [
    "Brazil", "United States", "Argentina", "Chile", "Colombia",
    "Mexico", "Panama", "Paraguay", "Peru", "Uruguay",
  ];

  const selectedCats = params.getAll("category");
  const selectedMfgs = params.getAll("manufacturer");
  const priceMin = Number(params.get("priceMin") ?? 0);
  const priceMax = Number(params.get("priceMax") ?? MAX_PRICE);
  const yearMin = Number(params.get("yearMin") ?? MIN_YEAR);
  const yearMax = Number(params.get("yearMax") ?? MAX_YEAR);
  const maxHours = params.get("maxHours") ?? "";
  const country = params.get("country") ?? "";
  const enginePrograms = params.getAll("engineProgram");
  const minSeats = params.get("minSeats") ?? "";
  const minRange = params.get("minRange") ?? "";
  const minSpeed = params.get("minSpeed") ?? "";
  const pressurized = params.get("pressurized") === "true";

  const hasFilters =
    selectedCats.length > 0 || selectedMfgs.length > 0 ||
    priceMin > 0 || priceMax < MAX_PRICE ||
    yearMin > MIN_YEAR || yearMax < MAX_YEAR ||
    maxHours || country || enginePrograms.length > 0 ||
    minSeats || minRange || minSpeed || pressurized;

  const toggleMulti = (key: string, value: string, current: string[]) => {
    if (current.includes(value)) {
      onChange(key, null); // signal removal
      // Need to rebuild without this value — handled in parent
    } else {
      onChange(key, value);
    }
  };

  const fmtPrice = (v: number) => formatPriceCompact(v, locale);

  const filteredMfgs = manufacturers.filter((m) =>
    m.name.toLowerCase().includes(mfgSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#0F172A]">{t.search.filters}</h2>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs text-[#2563EB] font-medium hover:underline flex items-center gap-1"
          >
            <X size={12} /> {t.search.clearAll}
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">{t.search.category}</p>
        <div className="space-y-2">
          {CATEGORIES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCats.includes(value)}
                onChange={() => toggleMulti("category", value, selectedCats)}
                className="w-4 h-4 rounded border-slate-300 text-[#2563EB] accent-[#2563EB]"
              />
              <span className="text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Manufacturer */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">{t.search.manufacturer}</p>
        <div className="relative">
          <button
            onClick={() => setMfgOpen((o) => !o)}
            className="w-full flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#64748B] hover:border-slate-300 transition-colors"
          >
            <span>
              {selectedMfgs.length > 0
                ? `${selectedMfgs.length} ${t.search.selected}`
                : t.search.allManufacturers}
            </span>
            <ChevronDown size={14} className={`transition-transform ${mfgOpen ? "rotate-180" : ""}`} />
          </button>

          {mfgOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t.search.searchManufacturers}
                    value={mfgSearch}
                    onChange={(e) => setMfgSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredMfgs.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMfgs.includes(m.id)}
                      onChange={() => toggleMulti("manufacturer", m.id, selectedMfgs)}
                      className="w-3.5 h-3.5 rounded accent-[#2563EB]"
                    />
                    <span className="text-sm text-[#0F172A]">{m.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected manufacturer tags */}
        {selectedMfgs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedMfgs.map((id) => {
              const m = manufacturers.find((x) => x.id === id);
              return m ? (
                <span
                  key={id}
                  className="flex items-center gap-1 bg-blue-50 text-[#2563EB] text-xs font-medium px-2 py-0.5 rounded-full"
                >
                  {m.name}
                  <button onClick={() => toggleMulti("manufacturer", id, selectedMfgs)}>
                    <X size={10} />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">{t.search.priceRange}</p>
        <DualSlider
          min={0} max={MAX_PRICE} step={PRICE_STEP}
          value={[priceMin, priceMax]}
          onChange={([lo, hi]) => {
            onChange("priceMin", lo > 0 ? String(lo) : null);
            onChange("priceMax", hi < MAX_PRICE ? String(hi) : null);
          }}
          format={fmtPrice}
        />
      </div>

      {/* Year range */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">{t.search.yearRange}</p>
        <DualSlider
          min={MIN_YEAR} max={MAX_YEAR} step={1}
          value={[yearMin, yearMax]}
          onChange={([lo, hi]) => {
            onChange("yearMin", lo > MIN_YEAR ? String(lo) : null);
            onChange("yearMax", hi < MAX_YEAR ? String(hi) : null);
          }}
        />
      </div>

      {/* Max TT hours */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">{t.search.maxTotalTime}</p>
        <FilterNumberInput
          value={maxHours}
          onChange={(v) => onChange("maxHours", v)}
          placeholder="e.g. 5,000"
          suffix={t.search.hrs}
          locale={locale}
        />
      </div>

      {/* Country */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">{t.search.country}</p>
        <select
          value={country}
          onChange={(e) => onChange("country", e.target.value || null)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="">{t.search.allCountries}</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Engine program */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">{t.search.engineProgram}</p>
        <div className="space-y-2">
          {["enrolled", "not_enrolled"].map((v) => (
            <label key={v} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={enginePrograms.includes(v)}
                onChange={() => toggleMulti("engineProgram", v, enginePrograms)}
                className="w-4 h-4 rounded border-slate-300 accent-[#2563EB]"
              />
              <span className="text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                {v === "enrolled" ? t.search.enrolled : t.search.notEnrolled}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Min passenger seats */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">{t.search.minSeats}</p>
        <FilterNumberInput
          value={minSeats}
          onChange={(v) => onChange("minSeats", v)}
          placeholder="e.g. 6"
          locale={locale}
        />
      </div>

      {/* Pressurized */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={pressurized}
            onChange={() => onChange("pressurized", pressurized ? null : "true")}
            className="w-4 h-4 rounded border-slate-300 accent-[#2563EB]"
          />
          <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider group-hover:text-[#2563EB] transition-colors">
            {t.search.pressurizedOnly}
          </span>
        </label>
      </div>

      {/* Min range */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">{t.search.minRange}</p>
        <FilterNumberInput
          value={minRange}
          onChange={(v) => onChange("minRange", v)}
          placeholder="e.g. 1,000"
          suffix="nm"
          locale={locale}
        />
      </div>

      {/* Min cruise speed */}
      <div>
        <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">{t.search.minSpeed}</p>
        <FilterNumberInput
          value={minSpeed}
          onChange={(v) => onChange("minSpeed", v)}
          placeholder="e.g. 250"
          suffix="kts"
          locale={locale}
        />
      </div>
    </div>
  );
}

// ── Main search component ─────────────────────────────────────────────────────

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();

  const SORT_OPTIONS = [
    { value: "newest", label: t.search.newestFirst },
    { value: "price_asc", label: t.search.priceLowHigh },
    { value: "price_desc", label: t.search.priceHighLow },
    { value: "hours_asc", label: t.search.lowestHours },
  ];

  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const supabase = createClient();

  // Load manufacturers once
  useEffect(() => {
    supabase.from("manufacturers").select("*").order("name").then(({ data }) => {
      if (data) setManufacturers(data as unknown as Manufacturer[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build Supabase query from URL params
  const buildQuery = useCallback(
    (offset: number, count = false) => {
      const cats = searchParams.getAll("category");
      const mfgs = searchParams.getAll("manufacturer");
      const priceMin = Number(searchParams.get("priceMin") ?? 0);
      const priceMax = Number(searchParams.get("priceMax") ?? MAX_PRICE);
      const yearMin = Number(searchParams.get("yearMin") ?? MIN_YEAR);
      const yearMax = Number(searchParams.get("yearMax") ?? MAX_YEAR);
      const maxHours = searchParams.get("maxHours");
      const country = searchParams.get("country");
      const enginePrograms = searchParams.getAll("engineProgram");
      const minSeats = searchParams.get("minSeats");
      const minRange = searchParams.get("minRange");
      const minSpeed = searchParams.get("minSpeed");
      const pressurized = searchParams.get("pressurized") === "true";
      const sort = searchParams.get("sort") ?? "newest";

      let q = supabase
        .from("aircraft_listings")
        .select(
          `id, title, year, asking_price, currency,
           location_city, location_state, location_country,
           total_time_hours, engine_program, condition_rating, featured, published_at, refreshed_at, dd_tier,
           aircraft_models!aircraft_model_id (
             id, name, category, manufacturer_id,
             manufacturers!manufacturer_id (id, name)
           ),
           listing_images!listing_id (image_url, is_primary, display_order)`,
          count ? { count: "exact" } : undefined
        )
        .eq("status", "active");

      // Direct column filters
      if (priceMin > 0) q = q.or(`asking_price.eq.0,asking_price.gte.${priceMin}`);
      if (priceMax < MAX_PRICE) q = q.or(`asking_price.eq.0,asking_price.lte.${priceMax}`);
      if (yearMin > MIN_YEAR) q = q.gte("year", yearMin);
      if (yearMax < MAX_YEAR) q = q.lte("year", yearMax);
      if (maxHours) q = q.or(`total_time_hours.is.null,total_time_hours.lte.${maxHours}`);
      if (country) q = q.eq("location_country", country);
      if (enginePrograms.length === 1) q = q.eq("engine_program", enginePrograms[0] as never);

      // Nested filters (PostgREST !inner syntax)
      if (cats.length === 1) q = q.eq("aircraft_models.category", cats[0] as never);
      if (mfgs.length === 1) {
        // Hero passes manufacturer name (e.g. "Cessna"), sidebar passes UUID — handle both
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mfgs[0]);
        if (isUUID) {
          q = q.eq("aircraft_models.manufacturer_id", mfgs[0]);
        } else {
          // Resolve name to ID from loaded manufacturers
          const match = manufacturers.find((m) => m.name.toLowerCase() === mfgs[0].toLowerCase());
          if (match) {
            q = q.eq("aircraft_models.manufacturer_id", match.id);
          }
          // If no match found, skip filter (shows all results instead of crashing)
        }
      }

      // Listing-level: min passenger seats
      if (minSeats) q = q.gte("passenger_seats", Number(minSeats));

      // Model-level filters (nested)
      if (pressurized) q = q.eq("aircraft_models.pressurized", true);
      if (minRange) q = q.gte("aircraft_models.typical_range_nm", Number(minRange));
      if (minSpeed) q = q.gte("aircraft_models.cruise_speed_kts", Number(minSpeed));

      // Sort
      if (sort === "price_asc") q = q.order("asking_price", { ascending: true });
      else if (sort === "price_desc") q = q.order("asking_price", { ascending: false });
      else if (sort === "hours_asc") q = q.order("total_time_hours", { ascending: true, nullsFirst: false });
      else q = q.order("published_at", { ascending: false });

      q = q.range(offset, offset + PAGE_SIZE - 1);
      return q;
    },
    [searchParams, supabase, manufacturers]
  );

  // Fetch on param change — use AbortController to cancel in-flight requests
  // when searchParams change rapidly (fixes "Lock broken" AbortError race condition)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setPage(0);

    const run = async () => {
      try {
        const { data, count, error } = await buildQuery(0, true).abortSignal(controller.signal);
        if (controller.signal.aborted) return;
        if (error) {
          console.error("[search] fetch error:", error.message, "| code:", error.code, "| details:", error.details, "| hint:", error.hint);
        }
        setListings(((data as unknown as ListingCardData[]) ?? []).filter((l) => l.aircraft_models != null));
        setTotal(count ?? 0);
        setLoading(false);
      } catch (err: unknown) {
        if (controller.signal.aborted) return; // expected — previous request cancelled
        console.error("[search] unexpected error:", err);
        setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [buildQuery]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const { data, error } = await buildQuery(nextPage * PAGE_SIZE);
    if (error) console.error("[search] loadMore error:", error.message, "| code:", error.code);
    setListings((prev) => [...prev, ...((data as unknown as ListingCardData[]) ?? []).filter((l) => l.aircraft_models != null)]);
    setPage(nextPage);
    setLoadingMore(false);
  };

  // URL param helpers
  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null) {
      // For multi-value keys, we need to rebuild
      next.delete(key);
    } else {
      // Check if it's a multi-value key
      const multiKeys = ["category", "manufacturer", "engineProgram"];
      if (multiKeys.includes(key)) {
        const current = next.getAll(key);
        if (current.includes(value)) {
          next.delete(key);
          current.filter((v) => v !== value).forEach((v) => next.append(key, v));
        } else {
          next.append(key, value);
        }
      } else {
        next.set(key, value);
      }
    }
    router.push(`/search?${next.toString()}`, { scroll: false });
  };

  const clearAll = () => router.push("/search", { scroll: false });

  const sort = searchParams.get("sort") ?? "newest";

  const hasMore = listings.length < total;

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] hover:border-slate-300 bg-white"
            >
              <SlidersHorizontal size={15} />
              {t.search.filters}
            </button>
            <p className="text-sm text-[#64748B]">
              {loading ? (
                <span className="animate-pulse">{t.search.searching}</span>
              ) : (
                <><strong className="text-[#0F172A]">{fmtNum(total, locale)}</strong> {t.search.aircraftFound}</>
              )}
            </p>
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-36">
              <Filters
                params={searchParams}
                manufacturers={manufacturers}
                onChange={updateParam}
                onClear={clearAll}
              />
            </div>
          </aside>

          {/* Results grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 h-72 animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-4xl mb-4">✈️</p>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">{t.search.noResults}</h3>
                <p className="text-[#64748B] text-sm mb-6">{t.search.noResultsSub}</p>
                <button
                  onClick={clearAll}
                  className="bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3B82F6] transition-colors text-sm"
                >
                  {t.search.clearFilters}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {listings.map((l) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      savedIds={savedIds}
                      onSaveChange={(id, saved) => {
                        setSavedIds((prev) => {
                          const next = new Set(prev);
                          saved ? next.add(id) : next.delete(id);
                          return next;
                        });
                      }}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="border-2 border-slate-200 hover:border-[#2563EB] text-[#0F172A] font-semibold px-8 py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
                    >
                      {loadingMore ? t.search.loading : `${t.search.loadMore} (${total - listings.length} ${t.search.remaining})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-[#0F172A]">{t.search.filters}</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-[#64748B]">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <Filters
                params={searchParams}
                manufacturers={manufacturers}
                onChange={(k, v) => { updateParam(k, v); }}
                onClear={() => { clearAll(); setMobileFiltersOpen(false); }}
              />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-6 w-full bg-[#2563EB] text-white font-semibold py-3 rounded-xl hover:bg-[#3B82F6] transition-colors"
              >
                {t.search.showResults.replace("{count}", String(total))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page export (Suspense required for useSearchParams) ───────────────────────

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
