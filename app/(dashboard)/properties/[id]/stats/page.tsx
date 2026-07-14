import { createClient } from "@/lib/supabase/server";
import { PropertyStatsView } from "@/components/dashboard/PropertyStatsView";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default async function PropertyStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Property existence/ownership is already guarded by the parent layout.
  const since = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, section, country")
    .eq("property_id", id)
    .gte("created_at", since);

  const rows = events ?? [];
  const totalVisits = rows.filter((e) => e.event_type === "guide_opened").length;

  const sectionCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();

  for (const e of rows) {
    if (e.event_type === "section_viewed" && e.section) {
      sectionCounts.set(e.section, (sectionCounts.get(e.section) ?? 0) + 1);
    }
    if (e.country) {
      countryCounts.set(e.country, (countryCounts.get(e.country) ?? 0) + 1);
    }
  }

  const topSections = Array.from(sectionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topCountries = Array.from(countryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <PropertyStatsView
      totalVisits={totalVisits}
      topSections={topSections}
      topCountries={topCountries}
    />
  );
}
