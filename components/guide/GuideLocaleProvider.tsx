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
  // Only set when visiting through a personalized guest link (see
  // lib/guestLinks.ts) — null on the generic slug-based guide, which has
  // no stay of its own to speak of. CheckinPanel uses this to show the
  // guest's real check-in/check-out dates instead of just the time of day.
  stayDates: { checkin: string; checkout: string } | null;
}

const GuideLocaleContext = createContext<GuideLocaleContextValue | null>(null);

export function GuideLocaleProvider({
  propertyId,
  sourceLocale,
  stayDates = null,
  children,
}: {
  propertyId: string;
  sourceLocale: GuideLocale;
  stayDates?: { checkin: string; checkout: string } | null;
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
    <GuideLocaleContext.Provider
      value={{ locale, setLocale, t, propertyId, sourceLocale, stayDates }}
    >
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
