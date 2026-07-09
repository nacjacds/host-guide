import { createServiceRoleClient } from "@/lib/supabase/server";
import type { TargetLocale } from "./constants";
import { translationKey, type PropertyTranslations } from "./lookup";

export type { PropertyTranslations } from "./lookup";
export { lookupTranslation } from "./lookup";

// content_translations has RLS enabled with no policies (same pattern as
// translations_cache) — only readable via the service-role client, same as
// the profiles lookup already done elsewhere in the guide route tree for
// anonymous/guest requests.
export async function fetchPropertyTranslations(
  propertyId: string,
  targetLocale: TargetLocale
): Promise<PropertyTranslations> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("content_translations")
    .select("block_type, block_id, translated_content")
    .eq("property_id", propertyId)
    .eq("target_locale", targetLocale);

  const translations: PropertyTranslations = {};
  for (const row of data ?? []) {
    translations[translationKey(row.block_type, row.block_id)] = row.translated_content;
  }
  return translations;
}
