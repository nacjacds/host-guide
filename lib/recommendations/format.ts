import type { AppLocale } from "@/lib/locale";

// Pinned to UTC explicitly — resetDate is always exactly UTC midnight (see
// startOfNextMonth in quota.ts), and without an explicit timeZone here,
// toLocaleString would render it in the local timezone of whoever calls
// it, which could show a time other than "00:00" depending on where it
// runs. Kept in its own file (no server-only imports) so it can be called
// both from server components (API error messages) and client components
// (PropertyRecommendationsSection, reacting instantly to a locale switch).
export function formatResetDate(date: Date, locale: AppLocale = "es"): string {
  const intlLocale = locale === "en" ? "en-GB" : "es-ES";
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
  return locale === "en" ? `${datePart} at ${timePart}` : `${datePart} a las ${timePart}`;
}
