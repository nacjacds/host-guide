import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generatePropertyRecommendations } from "@/lib/recommendations/generateRecommendations";
import { getRegenerationQuotaStatus, formatResetDate } from "@/lib/recommendations/quota";

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudieron generar recomendaciones" },
      { status: 500 }
    );
  }
}
