"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";
import { type AppLocale, setLocaleCookie } from "@/lib/locale";

const MESSAGES: Record<AppLocale, typeof esMessages> = {
  es: esMessages,
  en: enMessages,
};

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  // Passed down from a server component that already read the shared
  // NEXT_LOCALE cookie — when present, it wins outright and no client-side
  // detection/flash happens. In practice this is always set by now:
  // middleware.ts detects a locale from Accept-Language and writes the
  // cookie on every request that doesn't already have one, before this
  // component ever mounts — so `initialLocale` should only come back
  // undefined if middleware didn't run for some reason (e.g. a future
  // matcher change, a misconfigured edge/CDN layer in front of the app).
  initialLocale?: AppLocale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale ?? "es");

  useEffect(() => {
    if (initialLocale) return;
    // Defensive fallback only — see the comment on `initialLocale` above.
    // Spanish is the explicit special case; everything else (English,
    // French, German, ...) falls to English, matching
    // detectLocaleFromAcceptLanguage's rule in lib/locale.ts exactly, so
    // this and the middleware never disagree if both somehow ran.
    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith("es")) {
      setLocaleCookie("es");
    } else {
      setLocaleState("en");
      setLocaleCookie("en");
    }
  }, [initialLocale]);

  function setLocale(next: AppLocale) {
    setLocaleState(next);
    setLocaleCookie(next);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Europe/Madrid">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
