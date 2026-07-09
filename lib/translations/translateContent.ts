import { createHash } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { translateContentJson, translateContentText } from "@/lib/claude";
import { LOCALE_NAMES, type TargetLocale } from "./constants";
import type { TranslatablePayload } from "./extract";

export interface TranslateContentParams {
  propertyId: string;
  blockType: string;
  blockId: string | null;
  sourceLocale: string;
  targetLocale: TargetLocale;
  content: string | TranslatablePayload;
}

function hashContent(content: string | TranslatablePayload): string {
  const serialized = typeof content === "string" ? content : JSON.stringify(content);
  return createHash("sha256").update(serialized).digest("hex");
}

// Generates (or returns the cached version of) a translation for one piece
// of guide content. Never called from the guest-facing request path in the
// common case — this is invoked either in the background right after a
// host saves (see lib/translations/trigger.ts), or as the rare synchronous
// fallback when a guest hits a cache miss (app/api/guide/translate-block).
export async function translateContent(
  params: TranslateContentParams
): Promise<string | TranslatablePayload> {
  const { propertyId, blockType, blockId, sourceLocale, targetLocale, content } = params;
  const hash = hashContent(content);
  const supabase = createServiceRoleClient();

  // block_id is nullable (property-level content like welcome_message has
  // none), and Postgres unique constraints never treat two NULLs as a
  // conflict — so ON CONFLICT upserts silently insert duplicates for the
  // null case instead of updating. Doing a manual lookup-then-write here
  // works correctly for both the null and non-null cases.
  let existingQuery = supabase
    .from("content_translations")
    .select("id, source_hash, translated_content")
    .eq("property_id", propertyId)
    .eq("block_type", blockType)
    .eq("target_locale", targetLocale);
  existingQuery = blockId === null ? existingQuery.is("block_id", null) : existingQuery.eq("block_id", blockId);

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing && existing.source_hash === hash) {
    return existing.translated_content as string | TranslatablePayload;
  }

  const targetLanguageName = LOCALE_NAMES[targetLocale];
  const translated =
    typeof content === "string"
      ? await translateContentText(content, targetLanguageName)
      : ((await translateContentJson(
          content as unknown as Record<string, unknown>,
          targetLanguageName
        )) as unknown as TranslatablePayload);

  const row = {
    property_id: propertyId,
    block_type: blockType,
    block_id: blockId,
    source_locale: sourceLocale,
    target_locale: targetLocale,
    source_hash: hash,
    translated_content: translated,
    updated_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabase.from("content_translations").update(row).eq("id", existing.id)
    : await supabase.from("content_translations").insert(row);

  if (error) {
    // Translation itself succeeded — still return it so the caller isn't
    // blocked — but caching failed, so the next request will pay for
    // another Claude call instead of hitting cache.
    console.error("[translateContent] failed to cache translation", error);
  }

  return translated;
}
