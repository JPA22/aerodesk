export { default as en } from "./en";
export { default as pt } from "./pt";
export { default as es } from "./es";
export type { TranslationKeys } from "./en";

import en from "./en";
import pt from "./pt";
import es from "./es";
import type { TranslationKeys } from "./en";

export type Locale = "en" | "pt" | "es";

export const dictionaries: Record<Locale, TranslationKeys> = { en, pt, es };

export const locales: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];
