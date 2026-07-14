import { createHash } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { translateContentJson, translateContentText } from "@/lib/claude";
import { LOCALE_NAMES, type GuideLocale } from "./constants";
import type { TranslatablePayload } from "./extract";

export interface TranslateContentParams {
  propertyId: string;
  blockType: string;
  blockId: string | null;
  sourceLocale: GuideLocale;
  targetLocale: GuideLocale;
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

  // Cheap read-only check first, purely to skip paying for a Claude call
  // when already cached — NOT itself race-safe (two concurrent callers can
  // both pass this before either has written). That's fine: the actual
  // no-duplicate-rows guarantee comes from the atomic upsert RPC below,
  // not this check.
  let existingQuery = supabase
    .from("content_translations")
    .select("source_hash, translated_content")
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

  // Atomic upsert via RPC — safe even if another request is writing the
  // same (property_id, block_type, block_id, target_locale) key at the
  // exact same moment (see
  // supabase/migrations/20260713100000_content_translations_race_fix.sql).
  // A plain select-then-insert-or-update here has a check-then-act race
  // that silently produced duplicate rows for block_id IS NULL content
  // (Postgres unique constraints never treat two NULLs as a conflict).
  const { data: written, error } = await supabase.rpc("upsert_content_translation", {
    p_property_id: propertyId,
    p_block_type: blockType,
    p_block_id: blockId,
    p_source_locale: sourceLocale,
    p_target_locale: targetLocale,
    p_source_hash: hash,
    p_translated_content: translated as unknown as Record<string, unknown>,
  });

  if (error) {
    // Translation itself succeeded — still return it so the caller isn't
    // blocked — but caching failed, so the next request will pay for
    // another Claude call instead of hitting cache.
    console.error("[translateContent] failed to cache translation", error);
    return translated;
  }

  return (written ?? translated) as string | TranslatablePayload;
}
