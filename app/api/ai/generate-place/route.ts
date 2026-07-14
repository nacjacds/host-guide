import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generatePlaceSuggestion, type PlaceSuggestion } from "@/lib/claude";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";
import type { PlaceEntry } from "@/types";

const requestSchema = z.object({
  blockId: z.string().uuid(),
});

const CACHEABLE_TYPES = new Set(["parking"]);

function hashKey(parts: string[]): string {
  return createHash("md5").update(parts.join("|")).digest("hex");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: pick(locale, "Petición inválida", "Invalid request") }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan === "free") {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "Generar lugares con IA requiere un plan Starter o superior",
          "Generating places with AI requires a Starter plan or higher"
        ),
      },
      { status: 403 }
    );
  }

  const { data: block } = await supabase
    .from("guide_blocks")
    .select("id, property_id, type, content")
    .eq("id", parsed.data.blockId)
    .single();

  if (!block || !CACHEABLE_TYPES.has(block.type)) {
    return notFoundResponse(request, supabase, user.id, "block");
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("id", block.property_id)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
  }

  const existingNames =
    block.type === "parking"
      ? ((block.content as { rules?: string[] }).rules ?? [])
      : ((block.content as { places?: PlaceEntry[] }).places ?? []).map((p) => p.name);

  const serviceClient = createServiceRoleClient();
  const hash = hashKey([property.id, block.type, ...existingNames]);
  const cacheKey = `ai_place_${block.type}`;

  const { data: cached } = await serviceClient
    .from("translations_cache")
    .select("translated_text")
    .eq("source_text_hash", hash)
    .eq("target_lang", cacheKey)
    .maybeSingle();

  if (cached) {
    return NextResponse.json({ suggestion: JSON.parse(cached.translated_text) as PlaceSuggestion });
  }

  let suggestion: PlaceSuggestion;
  try {
    suggestion = await generatePlaceSuggestion({
      propertyName: property.name,
      address: property.address ?? "",
      blockType: block.type,
      excludeNames: existingNames,
    });
  } catch {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo generar una sugerencia con IA", "Couldn't generate an AI suggestion") },
      { status: 500 }
    );
  }

  await serviceClient.from("translations_cache").insert({
    source_text_hash: hash,
    source_lang: "es",
    target_lang: cacheKey,
    translated_text: JSON.stringify(suggestion),
  });

  return NextResponse.json({ suggestion });
}
