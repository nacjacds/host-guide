import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reorderSchema = z.object({
  blockIds: z.array(z.string().uuid()).min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = reorderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  const { blockIds } = parsed.data;

  const { data: existingBlocks } = await supabase
    .from("guide_blocks")
    .select("id")
    .eq("property_id", propertyId);

  const existingIds = new Set((existingBlocks ?? []).map((b) => b.id));
  const isSameSet =
    blockIds.length === existingIds.size && blockIds.every((id) => existingIds.has(id));

  if (!isSameSet) {
    return NextResponse.json(
      { error: "La lista de bloques no coincide con los de la propiedad" },
      { status: 400 }
    );
  }

  const results = await Promise.all(
    blockIds.map((blockId, index) =>
      supabase.from("guide_blocks").update({ order_index: index }).eq("id", blockId)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
