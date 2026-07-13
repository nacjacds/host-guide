import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generatePropertyRecommendations } from "@/lib/recommendations/generateRecommendations";
import { getRegenerationQuotaStatus } from "@/lib/recommendations/quota";
import { formatResetDate } from "@/lib/recommendations/format";

const regenerateSchema = z.object({
  // Omitted = regenerate every category (Settings' global button); present
  // = regenerate just that one section (per-card button in the Editor).
  category: z.enum(["attractions", "restaurants", "nightlife", "beaches", "nature"]).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  // TEMPORARY diagnostic logging — confirms the request is actually
  // reaching this handler at all (routing/deploy sanity check), remove
  // once geocoding failures are understood.
  console.error("[REGENERATE] Endpoint hit, property:", propertyId);
  // TEMPORARY fallback logging — console output isn't showing up in
  // production container logs, so also write directly to a file we can
  // `cat` from inside the container.
  fs.appendFileSync(
    "/tmp/debug.log",
    `${new Date().toISOString()} - [REGENERATE endpoint hit] ${JSON.stringify({ propertyId })}\n`
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = regenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  const quota = await getRegenerationQuotaStatus(user.id, profile?.plan);
  if (quota.remaining <= 0) {
    return NextResponse.json(
      {
        error: `Has usado tus ${quota.limit} regeneraciones manuales de este mes. Se restablecen el ${formatResetDate(quota.resetDate)}.`,
      },
      { status: 429 }
    );
  }

  try {
    const result = await generatePropertyRecommendations(propertyId, {
      category: parsed.data.category,
    });

    const serviceClient = createServiceRoleClient();
    await serviceClient.from("recommendation_regeneration_usage").insert({
      host_id: user.id,
      property_id: propertyId,
      trigger_type: "manual",
    });

    return NextResponse.json(result);
  } catch (err) {
    // TEMPORARY diagnostic logging — the catch block previously logged
    // nothing server-side, only returning err.message to the client.
    // Logs the full error (stack included) so any failure here, not just
    // geocoding ones, is visible in server logs.
    console.error("[REGENERATE] generatePropertyRecommendations failed:", err);
    // TEMPORARY fallback logging — see note above.
    fs.appendFileSync(
      "/tmp/debug.log",
      `${new Date().toISOString()} - [REGENERATE catch] ${JSON.stringify({
        propertyId,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })}\n`
    );
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudieron generar recomendaciones" },
      { status: 500 }
    );
  }
}
