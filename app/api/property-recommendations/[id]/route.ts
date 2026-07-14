import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { triggerRecommendationsTranslation } from "@/lib/translations/translateRecommendations";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { commonApiMessages } from "@/lib/apiMessages";

const editSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(600).nullable().optional(),
  // Undefined = leave whatever's already stored untouched (older callers
  // that don't know about this field). Null = host turned the override off
  // (or left the text empty), revert to automatic translation. A non-empty
  // string = manual override, protected from future auto-translation.
  description_en_override: z.string().trim().max(600).nullable().optional(),
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
    return NextResponse.json({ error: commonApiMessages.invalidData[locale] }, { status: 400 });
  }

  // RLS (property_recommendations_select_own) already restricts this to
  // rows on properties the caller hosts.
  const { data: existing } = await supabase
    .from("property_recommendations")
    .select("source")
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

  const { data: updated, error } = await supabase
    .from("property_recommendations")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      // undefined -> field omitted entirely -> column left untouched.
      ...(parsed.data.description_en_override !== undefined
        ? { description_en_override: parsed.data.description_en_override || null }
        : {}),
      source: nextSource,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Refresh the cached English translation for this whole category in the
  // background — a category's descriptions are cached together (see
  // triggerRecommendationsTranslation), so any edit invalidates the whole
  // set, not just this one row. Rows with a manual EN override are excluded
  // there, so this can never clobber one.
  const { data: categoryRows } = await supabase
    .from("property_recommendations")
    .select("id, description, description_en_override")
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
