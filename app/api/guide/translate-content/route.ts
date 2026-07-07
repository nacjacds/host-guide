import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { translateText } from "@/lib/claude";
import { createServiceRoleClient } from "@/lib/supabase/server";

const translateSchema = z.object({
  text: z.string().min(1).max(3000),
  propertyId: z.string().uuid().optional(),
});

const TARGET_LANG = "en";
const SOURCE_LANG = "es";

const IP_LIMIT = 20;
const IP_WINDOW_MS = 60 * 60 * 1000;
const PROPERTY_LIMIT = 100;
const PROPERTY_WINDOW_MS = 24 * 60 * 60 * 1000;

const ipCounters = new Map<string, { count: number; resetAt: number }>();
const propertyCounters = new Map<string, { count: number; resetAt: number }>();

function withinLimit(
  counters: Map<string, { count: number; resetAt: number }>,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = counters.get(key);

  if (!entry || entry.resetAt < now) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function hashText(text: string): string {
  return createHash("md5").update(text).digest("hex");
}

export async function POST(request: NextRequest) {
  const parsed = translateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Texto inválido" }, { status: 400 });
  }

  const { text, propertyId } = parsed.data;

  const ip = getClientIp(request);
  const ipOk = withinLimit(ipCounters, ip, IP_LIMIT, IP_WINDOW_MS);
  const propertyOk = propertyId
    ? withinLimit(propertyCounters, propertyId, PROPERTY_LIMIT, PROPERTY_WINDOW_MS)
    : true;

  if (!ipOk || !propertyOk) {
    return NextResponse.json({ translated: text });
  }

  const supabase = createServiceRoleClient();
  const hash = hashText(text);

  const { data: cached } = await supabase
    .from("translations_cache")
    .select("translated_text")
    .eq("source_text_hash", hash)
    .eq("target_lang", TARGET_LANG)
    .maybeSingle();

  if (cached) {
    return NextResponse.json({ translated: cached.translated_text });
  }

  try {
    const translated = await translateText(text, "English");

    await supabase.from("translations_cache").insert({
      source_text_hash: hash,
      source_lang: SOURCE_LANG,
      target_lang: TARGET_LANG,
      translated_text: translated,
    });

    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ translated: text });
  }
}
