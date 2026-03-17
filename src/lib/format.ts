const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  BRL: "R$",
  EUR: "€",
};

/**
 * Format a price for display.
 * - 0 → "Price on Request"
 * - Round numbers → "$8,550,000"
 * - Non-round → "$8,550,000.50"
 */
export function formatPrice(amount: number, currency: string): string {
  if (amount === 0) return "Price on Request";
  const sym = CURRENCY_SYMBOL[currency] ?? currency;
  const hasCents = amount % 1 !== 0;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
  return `${sym}${formatted}`;
}
