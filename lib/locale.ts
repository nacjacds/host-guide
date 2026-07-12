export type AppLocale = "es" | "en";

// Shared across the whole app (landing, login, register, and eventually the
// dashboard) so a language choice made on any route carries over to every
// other route — the public guest guide has its own independent locale
// system (lib/guide-i18n.ts) and must never read/write this cookie.
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function parseLocale(value: string | null | undefined): AppLocale {
  return value === "en" ? "en" : "es";
}

// Spanish is the explicit special case; everything else (English, French,
// German, a missing header, anything) falls to English — not the other
// way around. Only looks at the first (most-preferred) language tag in
// the header, e.g. "fr-FR,fr;q=0.9,en;q=0.8" -> "fr-fr" -> not Spanish -> "en".
export function detectLocaleFromAcceptLanguage(header: string | null | undefined): AppLocale {
  const primary = header?.split(",")[0]?.split(";")[0]?.trim().toLowerCase();
  return primary?.startsWith("es") ? "es" : "en";
}

// Client-side only — writes the cookie so every subsequent navigation
// (including full page loads, which remount the whole React tree) can read
// the same choice back via parseLocale() server-side.
export function setLocaleCookie(locale: AppLocale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
