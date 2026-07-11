"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";

export type LandingLocale = "es" | "en";

const MESSAGES: Record<LandingLocale, typeof esMessages> = {
  es: esMessages,
  en: enMessages,
};

interface LandingLocaleContextValue {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
}

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(null);

export function LandingLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<LandingLocale>("es");

  useEffect(() => {
    // navigator.language default, falling back to Spanish for anything
    // that isn't explicitly English — matches the rest of the app, which
    // is Spanish-first.
    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith("en")) setLocale("en");
  }, []);

  return (
    <LandingLocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
        {children}
      </NextIntlClientProvider>
    </LandingLocaleContext.Provider>
  );
}

export function useLandingLocale() {
  const ctx = useContext(LandingLocaleContext);
  if (!ctx) {
    throw new Error("useLandingLocale must be used within LandingLocaleProvider");
  }
  return ctx;
}
