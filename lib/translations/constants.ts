// The set of languages guests can view the guide in, beyond the host's
// source language. Adding a new language later means adding one entry
// here — no schema change needed (content_translations.target_locale is a
// plain text column, not a DB enum).
export const TARGET_LOCALES = ["en"] as const;
export type TargetLocale = (typeof TARGET_LOCALES)[number];

export function isTargetLocale(value: string): value is TargetLocale {
  return (TARGET_LOCALES as readonly string[]).includes(value);
}

// Host-authored content is always written in Spanish today. If WelcoKit
// ever supports hosts writing in another source language, this — and the
// "es" assumption in extract.ts's prompts — would need to become
// per-property (properties.language) instead of a constant.
export const SOURCE_LOCALE = "es";

export const LOCALE_NAMES: Record<TargetLocale, string> = {
  en: "English",
};
