"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  CheckCircle,
  ChevronRight,
  BarChart3,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fmtVal } from "@/lib/valuation";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Manufacturer {
  id: string;
  name: string;
}

interface AircraftModel {
  id: string;
  name: string;
  category: string;
  manufacturer_id: string;
}

interface SimilarListing {
  id: string;
  title: string;
  year: number;
  asking_price: number;
  currency: string;
  location_city: string | null;
  location_country: string;
  listing_images: Array<{ image_url: string; is_primary: boolean; display_order: number }>;
}

interface ValuationResponse {
  low: number;
  mid: number;
  high: number;
  trend: "appreciating" | "stable" | "depreciating";
  confidence: "high" | "medium" | "low";
  similar_listings: SimilarListing[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "jet", label: "Jets", icon: "✈️" },
  { key: "turboprop", label: "Turboprops", icon: "🛩️" },
  { key: "piston", label: "Pistons", icon: "🛫" },
  { key: "helicopter", label: "Helicopters", icon: "🚁" },
] as const;

const ENGINE_OPTIONS = [
  { value: "enrolled", label: "Enrolled" },
  { value: "not_enrolled", label: "Not Enrolled" },
  { value: "na", label: "N/A" },
];

const TREND_CONFIG = {
  appreciating: { icon: TrendingUp, label: "Appreciating", cls: "text-green-600 bg-green-50" },
  stable: { icon: Minus, label: "Stable", cls: "text-blue-600 bg-blue-50" },
  depreciating: { icon: TrendingDown, label: "Depreciating", cls: "text-orange-600 bg-orange-50" },
};

const CONFIDENCE_CONFIG = {
  high: { label: "High Confidence", cls: "text-green-700 bg-green-100", dot: "bg-green-500" },
  medium: { label: "Medium Confidence", cls: "text-yellow-700 bg-yellow-100", dot: "bg-yellow-500" },
  low: { label: "Low Confidence", cls: "text-slate-600 bg-slate-100", dot: "bg-slate-400" },
};

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors";

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ValuationClient({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const supabase = createClient();

  // Form state
  const [category, setCategory] = useState<string>("");
  const [manufacturerId, setManufacturerId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [models, setModels] = useState<AircraftModel[]>([]);
  const [year, setYear] = useState<string>("");
  const [totalTime, setTotalTime] = useState<string>("");
  const [engineTime, setEngineTime] = useState<string>("");
  const [condition, setCondition] = useState<number>(7);
  const [engineProgram, setEngineProgram] = useState<string>("na");

  // Results state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResponse | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Fetch models when manufacturer + category changes
  useEffect(() => {
    if (!manufacturerId || !category) {
      setModels([]);
      setModelId("");
      return;
    }
    supabase
      .from("aircraft_models")
      .select("id, name, category, manufacturer_id")
      .eq("manufacturer_id", manufacturerId)
      .eq("category", category as never)
      .order("name")
      .then(({ data }) => {
        setModels((data ?? []) as AircraftModel[]);
        setModelId("");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturerId, category]);

  const selectedModel = models.find((m) => m.id === modelId);
  const canSubmit = category && manufacturerId && (modelId || true) && year && Number(year) > 1950;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_name: selectedModel?.name ?? "",
          category,
          year: Number(year),
          total_time_hours: totalTime ? Number(totalTime) : null,
          engine_time_smoh: engineTime ? Number(engineTime) : null,
          condition_rating: condition,
          engine_program: engineProgram,
        }),
      });
      const data = (await res.json()) as ValuationResponse;
      setResult(data);
      // Scroll to results
      setTimeout(() => {
        document.getElementById("valuation-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      alert("Failed to get valuation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const trendCfg = result ? TREND_CONFIG[result.trend] : null;
  const confCfg = result ? CONFIDENCE_CONFIG[result.confidence] : null;

  // Position of mid price on the bar (always 50%)
  const lowPct = 0;
  const highPct = 100;
  const midPct = 50;

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#2563EB]/20 border border-[#2563EB]/30 text-[#3B82F6] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Zap size={12} />
            AI-Powered · Free · Instant
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Free Aircraft Valuation
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Get an instant AI-powered market estimate for any aircraft — jets, turboprops, pistons, or helicopters.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* ── Form Card ───────────────────────────────────────────────────── */}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 mb-8"
        >
          <h2 className="text-lg font-bold text-[#0F172A] mb-6">Aircraft Details</h2>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#0F172A] mb-3">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setCategory(cat.key);
                    setModelId("");
                  }}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 font-medium text-sm transition-all ${
                    category === cat.key
                      ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                      : "border-slate-200 text-[#64748B] hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manufacturer + Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Manufacturer</label>
              <select
                value={manufacturerId}
                onChange={(e) => setManufacturerId(e.target.value)}
                className={inputCls}
              >
                <option value="">Select manufacturer</option>
                {manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Model</label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                disabled={models.length === 0}
                className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`}
              >
                <option value="">
                  {models.length === 0 ? (category && manufacturerId ? "No models found" : "Select category & manufacturer first") : "Select model"}
                </option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Year + Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2018"
                min={1960}
                max={2026}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Total Time (hrs)
              </label>
              <input
                type="number"
                value={totalTime}
                onChange={(e) => setTotalTime(e.target.value)}
                placeholder="e.g. 1500"
                min={0}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Engine SMOH (hrs)
              </label>
              <input
                type="number"
                value={engineTime}
                onChange={(e) => setEngineTime(e.target.value)}
                placeholder="e.g. 800"
                min={0}
                className={inputCls}
              />
            </div>
          </div>

          {/* Condition + Engine Program */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Condition: <span className="text-[#2563EB] font-bold">{condition}/10</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={condition}
                onChange={(e) => setCondition(Number(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
              <div className="flex justify-between text-xs text-[#64748B] mt-1">
                <span>Project (1)</span>
                <span>Good (5)</span>
                <span>Like New (10)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Engine Program</label>
              <div className="flex gap-2">
                {ENGINE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEngineProgram(opt.value)}
                    className={`flex-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                      engineProgram === opt.value
                        ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                        : "border-slate-200 text-[#64748B] hover:border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20 text-base"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calculating…
              </>
            ) : (
              <>
                <BarChart3 size={18} />
                Get Valuation
              </>
            )}
          </button>
        </form>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {result && (
          <div id="valuation-results" className="space-y-6">
            {/* Main estimate card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Estimated Market Value</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Based on age, hours, condition, and market data
                  </p>
                </div>
                {/* Confidence */}
                {confCfg && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full ${confCfg.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${confCfg.dot}`} />
                    {confCfg.label}
                  </span>
                )}
              </div>

              {/* Range numbers */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Low</p>
                  <p className="text-xl font-bold text-[#64748B]">{fmtVal(result.low)}</p>
                </div>
                <div className="border-x border-slate-100">
                  <p className="text-xs text-[#2563EB] font-semibold mb-0.5">Mid (Est.)</p>
                  <p className="text-2xl font-bold text-[#0F172A]">{fmtVal(result.mid)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">High</p>
                  <p className="text-xl font-bold text-[#64748B]">{fmtVal(result.high)}</p>
                </div>
              </div>

              {/* Visual range bar */}
              <div className="relative h-5 rounded-full bg-gradient-to-r from-slate-200 via-[#2563EB] to-slate-200 mb-2 overflow-visible">
                {/* Low marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 border-2 border-white shadow"
                  style={{ left: `${lowPct}%` }}
                />
                {/* Mid marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white shadow-lg"
                  style={{ left: `${midPct}%`, transform: "translate(-50%, -50%)" }}
                />
                {/* High marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 border-2 border-white shadow"
                  style={{ right: `${100 - highPct}%`, transform: "translateY(-50%)" }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#64748B]">
                <span>{fmtVal(result.low)}</span>
                <span className="text-[#2563EB] font-semibold">{fmtVal(result.mid)}</span>
                <span>{fmtVal(result.high)}</span>
              </div>

              {/* Trend + Confidence row */}
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
                {trendCfg && (
                  <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${trendCfg.cls}`}>
                    <trendCfg.icon size={13} />
                    {trendCfg.label}
                  </div>
                )}
                <p className="text-xs text-[#64748B]">
                  {result.trend === "appreciating" && "Newer aircraft in this segment are holding or increasing in value."}
                  {result.trend === "stable" && "Aircraft in this age range are tracking stable market conditions."}
                  {result.trend === "depreciating" && "Older aircraft in this segment continue to depreciate gradually."}
                </p>
              </div>
            </div>

            {/* Similar listings */}
            {result.similar_listings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-[#0F172A]">Similar Listings on AeroDesk</h3>
                  <Link
                    href="/search"
                    className="text-xs text-[#2563EB] font-medium hover:underline flex items-center gap-1"
                  >
                    Browse all <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {result.similar_listings.map((l) => {
                    const img = l.listing_images?.find((i) => i.is_primary)?.image_url
                      ?? l.listing_images?.sort((a, b) => a.display_order - b.display_order)[0]?.image_url;
                    const sym = l.currency === "BRL" ? "R$" : l.currency === "EUR" ? "€" : "$";
                    const price = l.asking_price === 0
                      ? "Price on Request"
                      : `${sym}${l.asking_price.toLocaleString("en-US")}`;
                    const location = [l.location_city, l.location_country].filter(Boolean).join(", ");
                    return (
                      <Link
                        key={l.id}
                        href={`/listings/${l.id}`}
                        className="block rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-shadow"
                      >
                        <div className="h-32 bg-slate-100 overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={l.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">✈️</div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-semibold text-[#0F172A] truncate mb-1">{l.title}</p>
                          <p className="text-sm font-bold text-[#2563EB]">{price}</p>
                          {location && (
                            <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {location}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Email capture */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] rounded-2xl p-6 sm:p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="bg-[#2563EB] rounded-xl p-3 flex-shrink-0">
                  <BarChart3 size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Get your full market report</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Receive a detailed PDF with comparable sales data, depreciation curves, and seasonal trends for this aircraft type.
                  </p>
                  {emailSent ? (
                    <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                      <CheckCircle size={16} />
                      We&apos;ll send your report to {email}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <button
                        type="button"
                        onClick={() => { if (email.includes("@")) setEmailSent(true); }}
                        className="bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                      >
                        Get Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-[#64748B] text-center px-4">
              This estimate is for informational purposes only and is not a formal appraisal.
              Values vary based on market conditions, maintenance history, and optional equipment.
              Consult a certified aircraft appraiser for transaction purposes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
