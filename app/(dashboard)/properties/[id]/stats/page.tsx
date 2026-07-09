import { createClient } from "@/lib/supabase/server";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function BarList({
  emptyLabel,
  entries,
}: {
  emptyLabel: string;
  entries: [string, number][];
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = entries[0][1];

  return (
    <div className="space-y-2">
      {entries.map(([label, count]) => (
        <div key={label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">{count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Visitas (últimos 30 días)</p>
        <p className="text-3xl font-bold">{totalVisits}</p>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium text-muted-foreground">Secciones más consultadas</h2>
        <BarList entries={topSections} emptyLabel="Sin datos todavía." />
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium text-muted-foreground">Países de visitantes</h2>
        <BarList
          entries={topCountries}
          emptyLabel="Sin datos todavía (el país solo se detecta en producción)."
        />
      </div>
    </div>
  );
}
