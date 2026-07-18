import { createServiceRoleClient } from "@/lib/supabase/server";
import type { GuideLocale } from "./constants";
import { translationKey, type PropertyTranslationsByLocale } from "./lookup";

export type { PropertyTranslations, PropertyTranslationsByLocale } from "./lookup";
export { lookupTranslation } from "./lookup";

// content_translations has RLS enabled with no policies (same pattern as
// translations_cache) — only readable via the service-role client, same as
// the profiles lookup already done elsewhere in the guide route tree for
// anonymous/guest requests.
//
// Fetches every target locale in one query rather than the single guessed
// locale a server component could render — the guest's actual locale
// choice only exists client-side (GuideLocaleProvider), so prefetching all
// of them here is what makes switching languages instant with zero
// client-side Claude call, regardless of which of the N-1 non-source
// locales the guest picks.
export async function fetchPropertyTranslationsForLocales(
  propertyId: string,
  targetLocales: readonly GuideLocale[]
): Promise<PropertyTranslationsByLocale> {
  if (targetLocales.length === 0) return {};

  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("content_translations")
    .select("block_type, block_id, target_locale, translated_content")
    .eq("property_id", propertyId)
    .in("target_locale", targetLocales);

  const translations: PropertyTranslationsByLocale = {};
  for (const row of data ?? []) {
    const locale = row.target_locale as GuideLocale;
    const bucket = translations[locale] ?? (translations[locale] = {});
    bucket[translationKey(row.block_type, row.block_id)] = row.translated_content;
  }
  return translations;
}
