// Shared by admin components that render a raw date (host registration,
// ticket created-at, property deleted-at/purgeable-from) — was previously
// hardcoded to toLocaleDateString("es-ES") everywhere, same issue already
// fixed once for the recommendation quota reset date
// (lib/recommendations/format.ts). Takes a plain string rather than
// AppLocale/GuideLocale specifically — it's called from both the dashboard
// (AppLocale) and the guest guide (GuideLocale, see CheckinPanel), which
// are two separate locale unions that happen to overlap.
const INTL_LOCALE_TAGS: Record<string, string> = {
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
  it: "it-IT",
  pt: "pt-PT",
};

export function formatLocalizedDate(date: Date | string, locale: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(INTL_LOCALE_TAGS[locale] ?? "es-ES");
}
