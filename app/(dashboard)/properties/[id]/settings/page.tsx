import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertySettingsForm } from "@/components/editor/PropertySettingsForm";
import { DeletePropertyButton } from "@/components/editor/DeletePropertyButton";
import { getRegenerationQuotaStatus, formatResetDate } from "@/lib/recommendations/quota";
import { nextPlanWithMoreRegenerations } from "@/lib/plans";

export default async function PropertySettingsPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", property.host_id)
    .single();

  const quotaStatus = await getRegenerationQuotaStatus(property.host_id, profile?.plan);
  const upgradePlan = nextPlanWithMoreRegenerations(profile?.plan);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PropertySettingsForm
        property={property}
        recommendationQuota={{
          limit: quotaStatus.limit,
          used: quotaStatus.used,
          remaining: quotaStatus.remaining,
          resetDateLabel: formatResetDate(quotaStatus.resetDate),
        }}
        upgradePlanLabel={upgradePlan?.label ?? null}
      />
      <DeletePropertyButton propertyId={property.id} propertyName={property.name} />
    </div>
  );
}
