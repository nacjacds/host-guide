import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyEditor } from "@/components/editor/PropertyEditor";
import { getRegenerationQuotaStatus, formatResetDate } from "@/lib/recommendations/quota";
import { nextPlanWithMoreRegenerations } from "@/lib/plans";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) notFound();

  const { data: blocks } = await supabase
    .from("guide_blocks")
    .select("*")
    .eq("property_id", id)
    .order("order_index");

  const { data: recommendations } = await supabase
    .from("property_recommendations")
    .select("*")
    .eq("property_id", id)
    .order("display_order");

  const { data: recommendationMeta } = await supabase
    .from("property_recommendation_meta")
    .select("categories_detected")
    .eq("property_id", id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", property.host_id)
    .single();

  const quotaStatus = await getRegenerationQuotaStatus(property.host_id, profile?.plan);
  const upgradePlan = nextPlanWithMoreRegenerations(profile?.plan);

  return (
    <PropertyEditor
      property={property}
      initialBlocks={blocks ?? []}
      initialRecommendations={recommendations ?? []}
      categoriesDetected={recommendationMeta?.categories_detected ?? []}
      recommendationQuota={{
        limit: quotaStatus.limit,
        used: quotaStatus.used,
        remaining: quotaStatus.remaining,
        resetDateLabel: formatResetDate(quotaStatus.resetDate),
      }}
      upgradePlanLabel={upgradePlan?.label ?? null}
    />
  );
}
