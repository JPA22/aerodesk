"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { TranslationKeys } from "@/i18n";
import { dictionaries, type Locale } from "@/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: dictionaries.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Load saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aerodesk-locale") as Locale | null;
      if (saved && saved in dictionaries) {
        setLocaleState(saved);
      } else {
        // Auto-detect from browser
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("pt")) setLocaleState("pt");
        else if (browserLang.startsWith("es")) setLocaleState("es");
      }
    } catch {
      // SSR or localStorage unavailable
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("aerodesk-locale", newLocale);
    } catch {
      // ignore
    }
    // Update html lang attribute
    document.documentElement.lang = newLocale === "pt" ? "pt-BR" : newLocale;
  }, []);

  const t = dictionaries[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
