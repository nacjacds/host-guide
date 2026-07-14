import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

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
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = reorderSchema.safeParse(await request.json());
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: pick(locale, "Petición inválida", "Invalid request") }, { status: 400 });
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
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
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "La lista de bloques no coincide con los de la propiedad",
          "The block list doesn't match the property's blocks"
        ),
      },
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
