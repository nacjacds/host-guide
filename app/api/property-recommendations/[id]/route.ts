import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { triggerRecommendationsTranslation } from "@/lib/translations/translateRecommendations";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { apiMessage, pick } from "@/lib/apiMessages";
import { isValidMapsUrl } from "@/lib/mapsUrl";

const editSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(600).nullable().optional(),
  // Undefined = leave whatever's already stored untouched (older callers
  // that don't know about this field). Null = host turned the override off
  // (or left the text empty), revert to automatic translation. A non-empty
  // string = manual override, protected from future auto-translation.
  // Stored server-side as description_overrides.en (a per-locale JSONB
  // map) — the wire field name stays English-specific since the editor UI
  // only exposes an English override today.
  description_en_override: z.string().trim().max(600).nullable().optional(),
  // Empty string or omitted = leave the existing maps_url (auto-generated
  // from Google Places for ai_curated rows, or a previous manual override)
  // untouched. Only a non-empty value overwrites it — this field can never
  // clear maps_url back to null.
  maps_url: z
    .string()
    .trim()
    .max(2048)
    .optional()
    .refine((value) => !value || isValidMapsUrl(value), { message: "invalid_maps_url" }),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const body = await request.json().catch(() => ({}));
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user.id);
    const isInvalidMapsUrl = parsed.error.issues.some(
      (issue) => issue.message === "invalid_maps_url"
    );
    return NextResponse.json(
      {
        error: isInvalidMapsUrl
          ? pick(locale, "El link de Google Maps no es una URL válida", "The Google Maps link isn't a valid URL")
          : apiMessage("invalidData", locale),
      },
      { status: 400 }
    );
  }

  // RLS (property_recommendations_select_own) already restricts this to
  // rows on properties the caller hosts.
  const { data: existing } = await supabase
    .from("property_recommendations")
    .select("source, description_overrides")
    .eq("id", id)
    .single();

  if (!existing) {
    return notFoundResponse(request, supabase, user.id, "recommendation");
  }

  // Only a plain AI-curated row moves to "edited" — manual entries stay
  // "manual", and a row already marked "ai_curated_edited" stays that way.
  // This is what protects edits from being silently overwritten the next
  // time this category is regenerated (regeneration only ever replaces
  // rows whose source is still exactly "ai_curated").
  const nextSource = existing.source === "ai_curated" ? "ai_curated_edited" : existing.source;

  // description_overrides is a per-locale JSONB map ({en, fr, it, pt}) —
  // the editor UI only exposes an English override today, so this merges
  // into just the "en" key rather than replacing the whole object, in case
  // another locale's override is ever added by a future write path.
  const nextOverrides = { ...(existing.description_overrides ?? {}) };
  if (parsed.data.description_en_override !== undefined) {
    if (parsed.data.description_en_override) {
      nextOverrides.en = parsed.data.description_en_override;
    } else {
      delete nextOverrides.en;
    }
  }

  const { data: updated, error } = await supabase
    .from("property_recommendations")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      // undefined -> field omitted entirely -> column left untouched.
      ...(parsed.data.description_en_override !== undefined
        ? { description_overrides: nextOverrides }
        : {}),
      // Empty/omitted -> leave the existing maps_url untouched (see schema
      // comment above) — only ever overwritten by an explicit non-empty value.
      ...(parsed.data.maps_url ? { maps_url: parsed.data.maps_url } : {}),
      source: nextSource,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Refresh the cached translations for this whole category, for every
  // non-Spanish locale, in the background — a category's descriptions are
  // cached together (see triggerRecommendationsTranslation), so any edit
  // invalidates the whole set, not just this one row. Rows with a manual
  // override for a given locale are excluded there, so this can never
  // clobber one.
  const { data: categoryRows } = await supabase
    .from("property_recommendations")
    .select("id, description, description_overrides")
    .eq("property_id", updated.property_id)
    .eq("category", updated.category);
  triggerRecommendationsTranslation(updated.property_id, updated.category, categoryRows ?? []);

  return NextResponse.json({ recommendation: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  // RLS (property_recommendations_delete_own) already restricts this to
  // rows on properties the caller hosts, so no separate ownership query.
  const { error } = await supabase.from("property_recommendations").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
