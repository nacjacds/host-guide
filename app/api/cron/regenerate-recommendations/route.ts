import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { generatePropertyRecommendations } from "@/lib/recommendations/generateRecommendations";
import { REGENERATION_INTERVAL_DAYS } from "@/lib/recommendations/constants";
import { parseLocale, LOCALE_COOKIE_NAME } from "@/lib/locale";
import { apiMessage } from "@/lib/apiMessages";

// Vercel Cron target (see vercel.json) — regenerates local recommendations
// for any published, paid-plan property whose data is missing or older
// than REGENERATION_INTERVAL_DAYS. Manual "Regenerar" in Settings bypasses
// this schedule entirely (see .../property-recommendations/regenerate).
// Called by Vercel's scheduler, never a browser — no session, no
// meaningful NEXT_LOCALE cookie, so this always resolves to the default.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    const locale = parseLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value);
    return NextResponse.json({ error: apiMessage("notAuthorized", locale) }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const staleBefore = new Date(
    Date.now() - REGENERATION_INTERVAL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: publishedProperties } = await supabase
    .from("properties")
    .select("id, host_id")
    .eq("is_published", true);

  if (!publishedProperties || publishedProperties.length === 0) {
    return NextResponse.json({ regenerated: [], skipped: 0 });
  }

  const { data: paidProfiles } = await supabase
    .from("profiles")
    .select("id")
    .neq("plan", "free");
  const paidHostIds = new Set((paidProfiles ?? []).map((p) => p.id));

  const properties = publishedProperties.filter((p) => paidHostIds.has(p.host_id));

  if (properties.length === 0) {
    return NextResponse.json({ regenerated: [], skipped: 0 });
  }

  const { data: metaRows } = await supabase
    .from("property_recommendation_meta")
    .select("property_id, last_generated_at");

  const lastGeneratedByProperty = new Map(
    (metaRows ?? []).map((m) => [m.property_id, m.last_generated_at])
  );

  const dueProperties = properties.filter((p) => {
    const lastGeneratedAt = lastGeneratedByProperty.get(p.id);
    return !lastGeneratedAt || lastGeneratedAt < staleBefore;
  });

  const results = await Promise.allSettled(
    dueProperties.map((p) => generatePropertyRecommendations(p.id))
  );

  const succeeded = dueProperties.filter((_, i) => results[i].status === "fulfilled");
  const regenerated = succeeded.map((p) => p.id);
  const failed = dueProperties
    .filter((_, i) => results[i].status === "rejected")
    .map((p) => p.id);

  // Logged for traceability only — 'scheduled' rows never count against a
  // host's monthly manual-regeneration quota (see lib/recommendations/quota.ts).
  if (succeeded.length > 0) {
    await supabase.from("recommendation_regeneration_usage").insert(
      succeeded.map((p) => ({
        host_id: p.host_id,
        property_id: p.id,
        trigger_type: "scheduled" as const,
      }))
    );
  }

  return NextResponse.json({
    regenerated,
    failed,
    skipped: properties.length - dueProperties.length,
  });
}
