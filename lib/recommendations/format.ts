import type { AppLocale } from "@/lib/locale";

// Pinned to UTC explicitly — resetDate is always exactly UTC midnight (see
// startOfNextMonth in quota.ts), and without an explicit timeZone here,
// toLocaleString would render it in the local timezone of whoever calls
// it, which could show a time other than "00:00" depending on where it
// runs. Kept in its own file (no server-only imports) so it can be called
// both from server components (API error messages) and client components
// (PropertyRecommendationsSection, reacting instantly to a locale switch).
//
// Only es/en connector text ("a las" / "at") exists — fr/it/pt fall back
// to the English phrasing, same fallback direction as the rest of i18n
// Fase 0/1 (real fr/it/pt copy is later-phase content work).
const INTL_LOCALE_TAGS: Record<AppLocale, string> = {
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
  it: "it-IT",
  pt: "pt-PT",
};

export function formatResetDate(date: Date, locale: AppLocale = "es"): string {
  const intlLocale = INTL_LOCALE_TAGS[locale];
  const datePart = date.toLocaleDateString(intlLocale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const timePart = date.toLocaleTimeString(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return locale === "es" ? `${datePart} a las ${timePart}` : `${datePart} at ${timePart}`;
}
