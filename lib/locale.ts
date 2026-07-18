export type AppLocale = "es" | "en" | "fr" | "it" | "pt";

// Every locale the dashboard/landing/auth UI can be shown in. Adding a 6th
// locale later means adding it here — parseLocale/detectLocaleFromAcceptLanguage
// both derive from this single list rather than hardcoding a binary check.
export const ALL_APP_LOCALES: readonly AppLocale[] = ["es", "en", "fr", "it", "pt"];

export function isAppLocale(value: string): value is AppLocale {
  return (ALL_APP_LOCALES as readonly string[]).includes(value);
}

// Shared across the whole app (landing, login, register, and eventually the
// dashboard) so a language choice made on any route carries over to every
// other route — the public guest guide has its own independent locale
// system (lib/guide-i18n.ts) and must never read/write this cookie.
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function parseLocale(value: string | null | undefined): AppLocale {
  return value && isAppLocale(value) ? value : "es";
}

// English is the fallback for anything unrecognized (a missing header, a
// language WelcoKit doesn't support yet, malformed input) — every
// recognized locale, Spanish included, matches its own code explicitly
// rather than Spanish being a special case and everything else falling to
// English. Only looks at the first (most-preferred) language tag in the
// header, e.g. "fr-FR,fr;q=0.9,en;q=0.8" -> "fr-fr" -> starts with "fr" -> "fr".
export function detectLocaleFromAcceptLanguage(header: string | null | undefined): AppLocale {
  const primary = header?.split(",")[0]?.split(";")[0]?.trim().toLowerCase() ?? "";
  return ALL_APP_LOCALES.find((locale) => primary.startsWith(locale)) ?? "en";
}

// Client-side only — writes the cookie so every subsequent navigation
// (including full page loads, which remount the whole React tree) can read
// the same choice back via parseLocale() server-side.
export function setLocaleCookie(locale: AppLocale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
