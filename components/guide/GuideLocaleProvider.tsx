"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GUIDE_TRANSLATIONS, type GuideLocale, type GuideTranslationKey } from "@/lib/guide-i18n";

const STORAGE_KEY = "guide-locale";

interface GuideLocaleContextValue {
  locale: GuideLocale;
  setLocale: (locale: GuideLocale) => void;
  t: (key: GuideTranslationKey) => string;
  propertyId: string;
}

const GuideLocaleContext = createContext<GuideLocaleContextValue | null>(null);

export function GuideLocaleProvider({
  propertyId,
  children,
}: {
  propertyId: string;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<GuideLocale>("es");

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
    <GuideLocaleContext.Provider value={{ locale, setLocale, t, propertyId }}>
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
