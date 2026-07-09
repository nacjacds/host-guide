import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { extractTranslatable } from "@/lib/translations/extract";
import { translateContent } from "@/lib/translations/translateContent";
import { isTargetLocale, SOURCE_LOCALE } from "@/lib/translations/constants";
import type { BlockType } from "@/types";

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

  if (!isTargetLocale(targetLocale) || !withinLimit(getClientIp(request))) {
    return NextResponse.json({ translated: null });
  }

  // Public route — confirm this is a real, published property rather than
  // letting it be used as an open "translate anything" proxy.
  const supabase = createServiceRoleClient();
  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("is_published", true)
    .maybeSingle();
  if (!property) {
    return NextResponse.json({ translated: null });
  }

  try {
    if (blockType === "welcome_message") {
      if (typeof content !== "string" || !content.trim()) {
        return NextResponse.json({ translated: null });
      }
      const translated = await translateContent({
        propertyId,
        blockType: "welcome_message",
        blockId: null,
        sourceLocale: SOURCE_LOCALE,
        targetLocale,
        content,
      });
      return NextResponse.json({ translated });
    }

    if (typeof content !== "object" || content === null || !blockId) {
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
      sourceLocale: SOURCE_LOCALE,
      targetLocale,
      content: extracted,
    });

    return NextResponse.json({ translated });
  } catch (err) {
    console.error("[translate-block] fallback translation failed", err);
    return NextResponse.json({ translated: null });
  }
}
