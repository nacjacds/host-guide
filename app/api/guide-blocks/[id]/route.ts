import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateBlockSchema = z.object({
  title: z.string().max(120).nullable().optional(),
  icon: z.string().max(16).nullable().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  is_visible: z.boolean().optional(),
  order_index: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
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

  const parsed = updateBlockSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data: block, error } = await supabase
    .from("guide_blocks")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !block) {
    return NextResponse.json({ error: "Bloque no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ block });
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

  const { error } = await supabase.from("guide_blocks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
