export type AppLocale = "es" | "en";

// Shared across the whole app (landing, login, register, and eventually the
// dashboard) so a language choice made on any route carries over to every
// other route — the public guest guide has its own independent locale
// system (lib/guide-i18n.ts) and must never read/write this cookie.
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function parseLocale(value: string | null | undefined): AppLocale {
  return value === "en" ? "en" : "es";
}

// Client-side only — writes the cookie so every subsequent navigation
// (including full page loads, which remount the whole React tree) can read
// the same choice back via parseLocale() server-side.
export function setLocaleCookie(locale: AppLocale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
