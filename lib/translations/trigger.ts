import type { BlockType } from "@/types";
import { extractTranslatable } from "./extract";
import { translateContent } from "./translateContent";
import { guideTargetLocalesFor, type GuideLocale } from "./constants";

// Fire-and-forget: callers must NOT await this, so the host's save request
// returns immediately. Runs in the background against the same serverless
// invocation — if the process is frozen before it resolves (a known risk on
// some serverless platforms once the response has been sent), the next
// guest hitting a stale/missing cache entry falls back to the synchronous
// per-block translation path (app/api/guide/translate-block), so a dropped
// background run degrades gracefully rather than breaking anything.
//
// Fires one translateContent() call per non-source locale (N-1 calls, not
// 1) — each independently caught so one locale failing (e.g. a transient
// Claude error) doesn't stop the others from completing.
export function triggerBlockTranslation(params: {
  propertyId: string;
  blockType: BlockType;
  blockId: string;
  title: string | null;
  content: Record<string, unknown>;
  sourceLocale: GuideLocale;
}): void {
  const extracted = extractTranslatable(params.blockType, params.content, params.title);
  if (!extracted) return;

  for (const targetLocale of guideTargetLocalesFor(params.sourceLocale)) {
    translateContent({
      propertyId: params.propertyId,
      blockType: params.blockType,
      blockId: params.blockId,
      sourceLocale: params.sourceLocale,
      targetLocale,
      content: extracted,
    }).catch((err) => {
      console.error(
        "[translations] background block translation failed",
        params.blockType,
        params.blockId,
        targetLocale,
        err
      );
    });
  }
}

export function triggerWelcomeMessageTranslation(
  propertyId: string,
  welcomeMessage: string | null,
  sourceLocale: GuideLocale
): void {
  if (!welcomeMessage?.trim()) return;

  for (const targetLocale of guideTargetLocalesFor(sourceLocale)) {
    translateContent({
      propertyId,
      blockType: "welcome_message",
      blockId: null,
      sourceLocale,
      targetLocale,
      content: welcomeMessage,
    }).catch((err) => {
      console.error(
        "[translations] background welcome_message translation failed",
        propertyId,
        targetLocale,
        err
      );
    });
  }
}
