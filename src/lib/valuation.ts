// =============================================================================
// AeroDesk — Aircraft Valuation Algorithm
// Based on known market prices, depreciation curves, and spec adjustments.
// =============================================================================

/** Approximate new-delivery list prices (USD) for our seed model catalog. */
const MODEL_BASE_PRICES: Record<string, number> = {
  // ── Jets ──────────────────────────────────────────────────────────────────
  "Citation CJ4": 9_200_000,
  "Citation Latitude": 19_000_000,
  "Phenom 300E": 10_500_000,
  "Phenom 100EV": 4_600_000,
  "Praetor 500": 20_200_000,
  "Legacy 450": 16_000_000,
  "Challenger 350": 27_000_000,
  "Global 6500": 54_000_000,
  "G280": 25_000_000,
  "G550": 56_000_000,
  "Falcon 2000LXS": 31_000_000,
  "Falcon 6X": 55_000_000,
  // ── Turboprops ────────────────────────────────────────────────────────────
  "King Air 350": 7_100_000,
  "King Air 250": 5_200_000,
  "Grand Caravan EX": 2_100_000,
  "TBM 960": 5_200_000,
  "PC-12 NGX": 5_600_000,
  "M600/SLS": 4_600_000,
  // ── Pistons ───────────────────────────────────────────────────────────────
  "SR22T": 920_000,
  "SR20": 700_000,
  "Bonanza G36": 820_000,
  "Archer TX": 520_000,
  "Seneca V": 760_000,
  "182 Skylane": 500_000,
  "172 Skyhawk": 360_000,
  // ── Helicopters ───────────────────────────────────────────────────────────
  "R44 Raven II": 380_000,
  "R66 Turbine": 820_000,
  "H125": 3_100_000,
  "H145": 7_200_000,
  "407GXi": 3_600_000,
  "429": 8_200_000,
};

/** Category-level fallback midpoint when model is unknown. */
const CATEGORY_MIDPOINT: Record<string, number> = {
  jet: 18_000_000,
  turboprop: 4_000_000,
  piston: 500_000,
  helicopter: 2_500_000,
};

/** Annual compound depreciation rate by category. */
const DEPRECIATION_RATE: Record<string, number> = {
  jet: 0.055,
  turboprop: 0.060,
  piston: 0.040,
  helicopter: 0.065,
};

/** Expected annual flight hours (to gauge "high-time" penalty). */
const EXPECTED_HOURS_PER_YEAR: Record<string, number> = {
  jet: 200,
  turboprop: 250,
  piston: 300,
  helicopter: 180,
};

const CURRENT_YEAR = 2026; // from CLAUDE.md

export interface ValuationInput {
  model_name: string;
  category: string;
  year: number;
  total_time_hours?: number | null;
  engine_time_smoh?: number | null;
  condition_rating?: number | null;
  engine_program?: string | null;
}

export interface ValuationResult {
  low: number;
  mid: number;
  high: number;
  trend: "appreciating" | "stable" | "depreciating";
  confidence: "high" | "medium" | "low";
}

export function calculateValuation(input: ValuationInput): ValuationResult {
  const { model_name, category, year, total_time_hours, condition_rating, engine_program } = input;
  const cat = (category ?? "jet").toLowerCase();
  const age = Math.max(CURRENT_YEAR - year, 0);

  // ── 1. Base price ──────────────────────────────────────────────────────────
  const basePrice = MODEL_BASE_PRICES[model_name] ?? CATEGORY_MIDPOINT[cat] ?? 10_000_000;
  const hasModelData = model_name in MODEL_BASE_PRICES;

  // ── 2. Age depreciation (compound, floored at 18%) ────────────────────────
  const rate = DEPRECIATION_RATE[cat] ?? 0.055;
  const deprecFactor = Math.max(Math.pow(1 - rate, age), 0.18);
  let mid = basePrice * deprecFactor;

  // ── 3. Hours adjustment ────────────────────────────────────────────────────
  if (total_time_hours != null && total_time_hours > 0 && age > 0) {
    const expectedHours = (EXPECTED_HOURS_PER_YEAR[cat] ?? 200) * age;
    const ratio = total_time_hours / expectedHours;
    if (ratio > 1.15) {
      // High-time: up to -18% penalty
      mid *= 1 - Math.min((ratio - 1) * 0.45, 0.18);
    } else if (ratio < 0.65) {
      // Low-time: up to +5% premium
      mid *= 1.05;
    }
  }

  // ── 4. Condition adjustment ────────────────────────────────────────────────
  const condAdj: Record<number, number> = {
    1: -0.50, 2: -0.35, 3: -0.20, 4: -0.10,
    5: -0.05, 6: 0,     7: 0.04,  8: 0.08,
    9: 0.13,  10: 0.20,
  };
  if (condition_rating != null) {
    mid *= 1 + (condAdj[condition_rating] ?? 0);
  }

  // ── 5. Engine program ──────────────────────────────────────────────────────
  if (engine_program === "enrolled") {
    mid *= 1.12;
  } else if (engine_program === "not_enrolled") {
    mid *= 0.94;
  }

  // ── 6. Spread for Low / High ───────────────────────────────────────────────
  const spread = cat === "piston" ? 0.10 : 0.13;
  const low = mid * (1 - spread);
  const high = mid * (1 + spread);

  // ── 7. Trend ───────────────────────────────────────────────────────────────
  let trend: "appreciating" | "stable" | "depreciating";
  if (age <= 4) trend = "appreciating";
  else if (age <= 12) trend = "stable";
  else trend = "depreciating";

  // ── 8. Confidence ─────────────────────────────────────────────────────────
  // Elevated to "high" by the API when similar listings are found
  const confidence: "high" | "medium" | "low" = hasModelData ? "medium" : "low";

  return {
    low: Math.round(low),
    mid: Math.round(mid),
    high: Math.round(high),
    trend,
    confidence,
  };
}

/** Compact price formatter for valuation displays (no cents). */
export function fmtVal(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString("en-US")}`;
}

/** Where does `price` fall on the [low, high] bar? Returns 0-100. */
export function pricePosition(price: number, low: number, high: number): number {
  if (high <= low) return 50;
  return Math.round(Math.min(Math.max(((price - low) / (high - low)) * 100, 0), 100));
}

/** Price badge relative to the valuation mid. */
export function priceBadge(price: number, mid: number): {
  label: string;
  cls: string;
} {
  const ratio = price / mid;
  if (ratio < 0.93) return { label: "Below Market", cls: "bg-green-100 text-green-700" };
  if (ratio > 1.07) return { label: "Above Market", cls: "bg-orange-100 text-orange-700" };
  return { label: "Market Price", cls: "bg-blue-100 text-[#2563EB]" };
}
