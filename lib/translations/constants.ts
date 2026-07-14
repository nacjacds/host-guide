import type { GuideLocale } from "@/lib/guide-i18n";

export type { GuideLocale };

export function isGuideLocale(value: string): value is GuideLocale {
  return value === "es" || value === "en";
}

// properties.language is the authoritative record of which language a
// given property's guide_blocks/welcome_message were actually authored
// in (see app/api/ai/generate-content/route.ts, which now writes it at
// generation time). Defaults to "es" for any row where it's missing —
// matches the DB column default, so pre-existing properties keep working
// exactly as before this per-property source-locale system existed.
export function resolvePropertySourceLocale(language: string | null | undefined): GuideLocale {
  return language === "en" ? "en" : "es";
}

// Only two guide locales exist today, so "the target" is simply whichever
// one isn't the source. Adding a third locale later would turn this into
// a real list rather than a single opposite value.
export function guideTargetLocaleFor(sourceLocale: GuideLocale): GuideLocale {
  return sourceLocale === "es" ? "en" : "es";
}

export const LOCALE_NAMES: Record<GuideLocale, string> = {
  es: "Spanish",
  en: "English",
};

// property_recommendations descriptions are written by
// curateRecommendations()/describeManualPlace() (lib/claude.ts), which are
// deliberately hardcoded to always write in Spanish regardless of the
// host's dashboard_locale (see the comment on curateRecommendations) — so
// unlike guide_blocks/welcome_message, this pathway's source/target does
// NOT follow properties.language.
export const RECOMMENDATIONS_SOURCE_LOCALE: GuideLocale = "es";
export const RECOMMENDATIONS_TARGET_LOCALE: GuideLocale = "en";
