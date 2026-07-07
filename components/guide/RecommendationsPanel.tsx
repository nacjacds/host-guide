"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";
import { SectionHeading } from "./SectionHeading";
import type { Recommendation, RecommendationCategory } from "@/types";
import type { GuideTranslationKey } from "@/lib/guide-i18n";

const CATEGORY_KEY: Record<RecommendationCategory, GuideTranslationKey> = {
  restaurant: "category_restaurant",
  bar: "category_bar",
  supermarket: "category_supermarket",
  pharmacy: "category_pharmacy",
  transport: "category_transport",
  activity: "category_activity",
};

export function RecommendationsPanel({
  recommendations,
  accentColor,
  showHeading = true,
}: {
  recommendations: Recommendation[];
  accentColor: string;
  showHeading?: boolean;
}) {
  const { t } = useGuideLocale();

  const byCategory = new Map<RecommendationCategory, Recommendation[]>();
  for (const rec of recommendations) {
    const list = byCategory.get(rec.category) ?? [];
    list.push(rec);
    byCategory.set(rec.category, list);
  }

  return (
    <div>
      {showHeading && (
        <SectionHeading icon={MapPin} accentColor={accentColor}>
          {t("recommendations")}
        </SectionHeading>
      )}

      {recommendations.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("recommendationsEmpty")}
        </p>
      ) : (
        <div className="space-y-6">
          {Array.from(byCategory.entries()).map(([category, recs]) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                {t(CATEGORY_KEY[category])}
              </h3>
              <div className="space-y-3">
                {recs.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                  >
                    <p className="font-serif text-lg font-bold">{rec.name}</p>
                    {rec.address && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{rec.address}</p>
                    )}
                    {rec.description && (
                      <p className="mt-2 text-sm">{rec.description}</p>
                    )}
                    {rec.maps_url && (
                      <a
                        href={rec.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-90"
                        style={{ backgroundColor: accentColor }}
                      >
                        <ExternalLink size={14} strokeWidth={1.5} />
                        {t("viewOnMap")}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
