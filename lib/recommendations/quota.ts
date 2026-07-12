import { createServiceRoleClient } from "@/lib/supabase/server";
import { planRecommendationRegenerationLimit } from "@/lib/plans";

export interface RegenerationQuotaStatus {
  limit: number;
  used: number;
  remaining: number;
  resetDate: Date;
}

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function startOfNextMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

// Quota is shared across every property the host owns — counts manual
// regenerations regardless of which property triggered them. Scheduled
// (cron) regenerations never count here.
export async function getRegenerationQuotaStatus(
  hostId: string,
  planId: string | null | undefined
): Promise<RegenerationQuotaStatus> {
  const limit = planRecommendationRegenerationLimit(planId);
  const supabase = createServiceRoleClient();

  const { count } = await supabase
    .from("recommendation_regeneration_usage")
    .select("id", { count: "exact", head: true })
    .eq("host_id", hostId)
    .eq("trigger_type", "manual")
    .gte("triggered_at", startOfCurrentMonth().toISOString());

  const used = count ?? 0;
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    resetDate: startOfNextMonth(),
  };
}

// Pinned to UTC explicitly — resetDate is always exactly UTC midnight (see
// startOfNextMonth above), and without an explicit timeZone here,
// toLocaleString would render it in the server process's local timezone,
// which could show a time other than "00:00" depending on where it runs.
export function formatResetDate(date: Date): string {
  const datePart = date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const timePart = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${datePart} a las ${timePart}`;
}
