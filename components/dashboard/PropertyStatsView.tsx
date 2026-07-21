"use client";

import { useTranslations } from "next-intl";

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

export function PropertyStatsView({
  totalVisits,
  topSections,
  topCountries,
  topCities,
}: {
  totalVisits: number;
  topSections: [string, number][];
  topCountries: [string, number][];
  topCities: [string, number][];
}) {
  const t = useTranslations("dashboard.stats");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">{t("visits30days")}</p>
        <p className="text-3xl font-bold">{totalVisits}</p>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("topSections")}</h2>
        <BarList entries={topSections} emptyLabel={t("noDataYet")} />
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("topCountries")}</h2>
        <BarList entries={topCountries} emptyLabel={t("noCountryDataYet")} />
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("topCities")}</h2>
        <BarList entries={topCities} emptyLabel={t("noCityDataYet")} />
      </div>
    </div>
  );
}
