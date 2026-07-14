import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { coverImageStoragePath } from "@/lib/utils";
import { notAuthorizedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

const PURGE_CONFIRM_PHRASE = "BORRAR PERMANENTEMENTE";

const purgeSchema = z.object({
  confirmPhrase: z.literal(PURGE_CONFIRM_PHRASE),
});

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    return notAuthorizedResponse(request, supabase, user?.id ?? null);
  }

  // Re-checked server-side, not just client-side — this is irreversible.
  const parsed = purgeSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user!.id);
    return NextResponse.json(
      { error: pick(locale, "Falta la confirmación exacta", "Missing the exact confirmation") },
      { status: 400 }
    );
  }

  const serviceClient = createServiceRoleClient();
  const { data: property } = await serviceClient
    .from("properties")
    .select("id, name, cover_image_url, deleted_at")
    .eq("id", id)
    .single();

  if (!property) {
    return notFoundResponse(request, supabase, user!.id, "property");
  }

  // Only ever purge something already soft-deleted — forces the two-step
  // flow (host deletes, then admin purges) rather than letting a single
  // click destroy a live property no one asked to remove.
  if (!property.deleted_at) {
    const locale = await getApiLocale(request, supabase, user!.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "Solo se pueden purgar propiedades ya borradas por el host",
          "Only properties already deleted by the host can be purged"
        ),
      },
      { status: 400 }
    );
  }

  // Every FK into properties is ON DELETE CASCADE (recommendations,
  // guide_blocks, translations, meta, usage, analytics — see
  // supabase/migrations for the full list), so the row delete below cleans
  // up everything in the database automatically. Storage objects are not
  // covered by SQL cascade, so the cover image needs an explicit delete.
  if (property.cover_image_url) {
    const path = coverImageStoragePath(property.cover_image_url);
    if (path) {
      await serviceClient.storage.from("cover-images").remove([path]);
    }
  }

  const { error } = await serviceClient.from("properties").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
