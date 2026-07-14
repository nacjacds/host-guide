import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { extractTranslatable, type TranslatablePayload } from "@/lib/translations/extract";
import { translateContent } from "@/lib/translations/translateContent";
import {
  isGuideLocale,
  resolvePropertySourceLocale,
  RECOMMENDATIONS_SOURCE_LOCALE,
  RECOMMENDATIONS_TARGET_LOCALE,
} from "@/lib/translations/constants";
import {
  BASE_RECOMMENDATION_CATEGORIES,
  OPTIONAL_RECOMMENDATION_CATEGORIES,
} from "@/lib/recommendations/constants";
import type { BlockType } from "@/types";

const RECOMMENDATION_CATEGORIES: readonly string[] = [
  ...BASE_RECOMMENDATION_CATEGORIES,
  ...OPTIONAL_RECOMMENDATION_CATEGORIES,
];

// This is the rare-exception path: the guest guide reads pre-generated
// translations from content_translations (see app/guide/[slug]/...), and
// only calls this route when that cache is missing for a specific block —
// e.g. content was just saved and the background translation trigger
// hasn't finished yet. It should almost never fire in normal operation.

const IP_LIMIT = 30;
const IP_WINDOW_MS = 60 * 60 * 1000;
const ipCounters = new Map<string, { count: number; resetAt: number }>();

function withinLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounters.get(ip);
  if (!entry || entry.resetAt < now) {
    ipCounters.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  if (entry.count >= IP_LIMIT) return false;
  entry.count += 1;
  return true;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const requestSchema = z.object({
  propertyId: z.string().uuid(),
  targetLocale: z.string(),
  blockType: z.string(),
  blockId: z.string().nullable(),
  title: z.string().nullable().optional(),
  content: z.union([z.string(), z.record(z.string(), z.unknown())]),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ translated: null });
  }
  const { propertyId, targetLocale, blockType, blockId, title, content } = parsed.data;

  if (!isGuideLocale(targetLocale) || !withinLimit(getClientIp(request))) {
    return NextResponse.json({ translated: null });
  }

  // Public route — confirm this is a real, published property rather than
  // letting it be used as an open "translate anything" proxy. Also carries
  // properties.language, the authoritative source locale for this
  // property's guide_blocks/welcome_message (see
  // lib/translations/constants.ts's resolvePropertySourceLocale) — derived
  // server-side rather than trusted from the client.
  const supabase = createServiceRoleClient();
  const { data: property } = await supabase
    .from("properties")
    .select("id, language")
    .eq("id", propertyId)
    .eq("is_published", true)
    .maybeSingle();
  if (!property) {
    return NextResponse.json({ translated: null });
  }

  const propertySourceLocale = resolvePropertySourceLocale(property.language);

  try {
    if (blockType === "welcome_message") {
      if (typeof content !== "string" || !content.trim() || targetLocale === propertySourceLocale) {
        return NextResponse.json({ translated: null });
      }
      const translated = await translateContent({
        propertyId,
        blockType: "welcome_message",
        blockId: null,
        sourceLocale: propertySourceLocale,
        targetLocale,
        content,
      });
      return NextResponse.json({ translated });
    }

    if (RECOMMENDATION_CATEGORIES.includes(blockType)) {
      // Recommendation descriptions are always Claude-written in Spanish
      // regardless of properties.language (see curateRecommendations in
      // lib/claude.ts) — this branch intentionally stays pinned to the
      // fixed recommendations source/target, not the dynamic per-property
      // one used just above and below.
      if (
        typeof content !== "object" ||
        content === null ||
        targetLocale !== RECOMMENDATIONS_TARGET_LOCALE
      ) {
        return NextResponse.json({ translated: null });
      }
      const translated = await translateContent({
        propertyId,
        blockType,
        blockId: null,
        sourceLocale: RECOMMENDATIONS_SOURCE_LOCALE,
        targetLocale,
        content: content as unknown as TranslatablePayload,
      });
      return NextResponse.json({ translated });
    }

    if (
      typeof content !== "object" ||
      content === null ||
      !blockId ||
      targetLocale === propertySourceLocale
    ) {
      return NextResponse.json({ translated: null });
    }

    const extracted = extractTranslatable(blockType as BlockType, content, title ?? null);
    if (!extracted) {
      return NextResponse.json({ translated: null });
    }

    const translated = await translateContent({
      propertyId,
      blockType,
      blockId,
      sourceLocale: propertySourceLocale,
      targetLocale,
      content: extracted,
    });

    return NextResponse.json({ translated });
  } catch (err) {
    console.error("[translate-block] fallback translation failed", err);
    return NextResponse.json({ translated: null });
  }
}
