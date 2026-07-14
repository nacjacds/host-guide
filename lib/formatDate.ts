import type { AppLocale } from "@/lib/locale";

// Shared by admin components that render a raw date (host registration,
// ticket created-at, property deleted-at/purgeable-from) — was previously
// hardcoded to toLocaleDateString("es-ES") everywhere, same issue already
// fixed once for the recommendation quota reset date
// (lib/recommendations/format.ts).
export function formatLocalizedDate(date: Date | string, locale: AppLocale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "es-ES");
}
