import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generatePropertyRecommendations } from "@/lib/recommendations/generateRecommendations";
import { getRecommendationRegenerationStatus } from "@/lib/recommendations/quota";
import { recordFreeGenerationUsage } from "@/lib/recommendations/freeGenerationGate";
import {
  BASE_RECOMMENDATION_CATEGORIES,
  OPTIONAL_RECOMMENDATION_CATEGORIES,
} from "@/lib/recommendations/constants";
import { formatResetDate } from "@/lib/recommendations/format";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";
import { isSuperAdmin } from "@/lib/admin";
import type { PropertyRecommendationCategory } from "@/types";

const ALL_CATEGORIES: PropertyRecommendationCategory[] = [
  ...BASE_RECOMMENDATION_CATEGORIES,
  ...OPTIONAL_RECOMMENDATION_CATEGORIES,
];

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
    return notAuthenticatedResponse(request, supabase);
  }

  const body = await request.json().catch(() => ({}));
  const parsed = regenerateSchema.safeParse(body);
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: pick(locale, "Categoría inválida", "Invalid category") }, { status: 400 });
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
    return notFoundResponse(request, supabase, user.id, "property");
  }

  const categoriesToProcess = parsed.data.category ? [parsed.data.category] : ALL_CATEGORIES;
  const admin = isSuperAdmin(user.email);

  const statusBefore = await getRecommendationRegenerationStatus(propertyId, categoriesToProcess, {
    planId: profile?.plan,
    isSuperAdmin: admin,
    email: user.email,
  });

  const blocked = categoriesToProcess.find((category) => !statusBefore[category].available);
  if (blocked) {
    const reason = statusBefore[blocked].blockedReason;
    const locale = await getApiLocale(request, supabase, user.id);
    const message =
      reason === "plan"
        ? pick(
            locale,
            "Regenerar recomendaciones requiere un plan de pago",
            "Regenerating recommendations requires a paid plan"
          )
        : reason === "free_generation_used"
          ? pick(
              locale,
              "Ya usaste tu generación gratuita con IA para esta categoría. Mejora tu plan para generar más.",
              "You've already used your free AI generation for this category. Upgrade your plan to generate more."
            )
          : reason === "plan_locked_out"
            ? pick(
                locale,
                "El plan Free ya no incluye generación con IA. Mejora tu plan para generar recomendaciones.",
                "The Free plan no longer includes AI generation. Upgrade your plan to generate recommendations."
              )
            : pick(
                locale,
                `Ya has regenerado esta categoría este mes. Vuelve a estar disponible el ${formatResetDate(new Date(statusBefore[blocked].nextAvailableAt!), locale)}.`,
                `You've already regenerated this category this month. It'll be available again on ${formatResetDate(new Date(statusBefore[blocked].nextAvailableAt!), locale)}.`
              );
    return NextResponse.json({ error: message }, { status: 429 });
  }

  try {
    const result = await generatePropertyRecommendations(propertyId, {
      category: parsed.data.category,
    });

    // Only a genuine regeneration (the category already had content before
    // this run) counts as usage — a category's first-ever generation is
    // always free, and super admins never consume or gate on this at all
    // (see getRecommendationRegenerationStatus).
    if (!admin) {
      const categoriesToRecord = categoriesToProcess.filter(
        (category) => !statusBefore[category].isFirstGeneration
      );
      if (categoriesToRecord.length > 0) {
        const serviceClient = createServiceRoleClient();
        await serviceClient.from("recommendation_regeneration_usage").insert(
          categoriesToRecord.map((category) => ({
            host_id: user.id,
            property_id: propertyId,
            category,
            trigger_type: "manual" as const,
          }))
        );
      }

      // The inverse set — categories this run just spent their free
      // first-ever generation on — so this email can never get another
      // free generation for them again, even from a different property
      // (including one created after this one is deleted).
      const categoriesJustUsedFree = categoriesToProcess.filter(
        (category) => statusBefore[category].isFirstGeneration
      );
      if (categoriesJustUsedFree.length > 0 && user.email) {
        await recordFreeGenerationUsage(user.email, categoriesJustUsedFree);
      }
    }

    const quotaStatus = await getRecommendationRegenerationStatus(propertyId, categoriesToProcess, {
      planId: profile?.plan,
      isSuperAdmin: admin,
      email: user.email,
    });

    return NextResponse.json({ ...result, quotaStatus });
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
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : pick(locale, "No se pudieron generar recomendaciones", "Couldn't generate recommendations"),
      },
      { status: 500 }
    );
  }
}
