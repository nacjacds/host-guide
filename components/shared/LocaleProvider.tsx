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
  // detection/flash happens. Undefined only on a visitor's very first-ever
  // request, before any cookie has been set.
  initialLocale?: AppLocale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale ?? "es");

  useEffect(() => {
    if (initialLocale) return;
    // First-ever visit, no NEXT_LOCALE cookie yet — fall back to the
    // browser's language and persist it immediately, so this detected
    // preference is what every other route reads from now on.
    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith("en")) {
      setLocaleState("en");
      setLocaleCookie("en");
    } else {
      setLocaleCookie("es");
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
