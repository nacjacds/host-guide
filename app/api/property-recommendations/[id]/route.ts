import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const editSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(600).nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // RLS (property_recommendations_select_own) already restricts this to
  // rows on properties the caller hosts.
  const { data: existing } = await supabase
    .from("property_recommendations")
    .select("source")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Recomendación no encontrada" }, { status: 404 });
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
      source: nextSource,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recommendation: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // RLS (property_recommendations_delete_own) already restricts this to
  // rows on properties the caller hosts, so no separate ownership query.
  const { error } = await supabase.from("property_recommendations").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
