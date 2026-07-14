"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GUIDE_TRANSLATIONS, type GuideLocale, type GuideTranslationKey } from "@/lib/guide-i18n";

const STORAGE_KEY = "guide-locale";

interface GuideLocaleContextValue {
  locale: GuideLocale;
  setLocale: (locale: GuideLocale) => void;
  t: (key: GuideTranslationKey) => string;
  propertyId: string;
  // The language this property's guide_blocks/welcome_message were
  // actually authored in (properties.language, resolved server-side —
  // see resolvePropertySourceLocale). Used by useTranslatedBlock to decide
  // whether the currently-displayed `locale` needs translated content at
  // all, instead of assuming the source is always Spanish.
  sourceLocale: GuideLocale;
}

const GuideLocaleContext = createContext<GuideLocaleContextValue | null>(null);

export function GuideLocaleProvider({
  propertyId,
  sourceLocale,
  children,
}: {
  propertyId: string;
  sourceLocale: GuideLocale;
  children: React.ReactNode;
}) {
  // Seeded from the property's own source language rather than hardcoded
  // "es" — an English-authored property should default to showing English
  // to a first-time guest. A stored per-browser preference (below) still
  // overrides this on repeat visits, to any property.
  const [locale, setLocaleState] = useState<GuideLocale>(sourceLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") setLocaleState(stored);
  }, []);

  function setLocale(next: GuideLocale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  function t(key: GuideTranslationKey) {
    return GUIDE_TRANSLATIONS[locale][key];
  }

  return (
    <GuideLocaleContext.Provider value={{ locale, setLocale, t, propertyId, sourceLocale }}>
      {children}
    </GuideLocaleContext.Provider>
  );
}

export function useGuideLocale() {
  const ctx = useContext(GuideLocaleContext);
  if (!ctx) {
    throw new Error("useGuideLocale must be used within GuideLocaleProvider");
  }
  return ctx;
}
