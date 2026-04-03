import type { Locale } from "@/i18n";

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  BRL: "R$",
  EUR: "€",
};

/** Map AeroDesk locale → JS Intl locale string. */
export function getJsLocale(locale: Locale = "en"): string {
  const map: Record<Locale, string> = { en: "en-US", pt: "pt-BR", es: "es-ES" };
  return map[locale] ?? "en-US";
}

/**
 * Format a number with locale-aware thousand/decimal separators.
 * EN: 1,234.56  |  PT/ES: 1.234,56
 */
export function fmtNum(
  n: number,
  locale: Locale = "en",
  opts?: Intl.NumberFormatOptions,
): string {
  return n.toLocaleString(getJsLocale(locale), opts);
}

/**
 * Format a price for display.
 * - 0 → "Price on Request"
 * - Round numbers → "$8,550,000" / "R$8.550.000"
 * - Non-round → "$8,550,000.50" / "R$8.550.000,50"
 */
export function formatPrice(amount: number, currency: string, locale: Locale = "en"): string {
  if (amount === 0) return "Price on Request";
  const sym = CURRENCY_SYMBOL[currency] ?? currency;
  const hasCents = amount % 1 !== 0;
  const formatted = fmtNum(amount, locale, {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
  return `${sym}${formatted}`;
}

/**
 * Compact price for sliders/charts: "$1.2M", "$550K", "$900"
 * Uses dot for M/K abbreviations (universal) — only full numbers get locale formatting.
 */
export function formatPriceCompact(v: number, locale: Locale = "en"): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${fmtNum(v, locale)}`;
}
