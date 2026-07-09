import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { blockImageStoragePath } from "@/lib/utils";
import { triggerBlockTranslation } from "@/lib/translations/trigger";

const blockImageSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  caption: z.string().max(120),
});

const updateBlockSchema = z.object({
  title: z.string().max(120).nullable().optional(),
  icon: z.string().max(16).nullable().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  images: z.array(blockImageSchema).max(3).optional(),
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

  // Fire-and-forget: only re-translate when content/title actually changed,
  // not on a plain visibility/order toggle.
  if (parsed.data.content !== undefined || parsed.data.title !== undefined) {
    triggerBlockTranslation({
      propertyId: block.property_id,
      blockType: block.type,
      blockId: block.id,
      title: block.title,
      content: block.content,
    });
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

  const { data: existing } = await supabase
    .from("guide_blocks")
    .select("images")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("guide_blocks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existing?.images?.length) {
    const paths = existing.images.map((img) => blockImageStoragePath(img.url)).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from("block-images").remove(paths as string[]);
    }
  }

  return NextResponse.json({ ok: true });
}
