"use client";

import { ExternalLink, Star } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";
import { useTranslatedRecommendations } from "./useTranslatedRecommendations";
import type { TranslatablePayload } from "@/lib/translations/extract";
import type { PropertyRecommendation } from "@/types";

function formatDistance(
  rec: PropertyRecommendation,
  t: (key: "walkingMinutes") => string
): string | null {
  const parts: string[] = [];
  if (rec.distance_meters != null) {
    parts.push(
      rec.distance_meters < 1000
        ? `${rec.distance_meters}m`
        : `${(rec.distance_meters / 1000).toFixed(1)}km`
    );
  }
  if (rec.distance_walking_minutes != null) {
    parts.push(`${rec.distance_walking_minutes} ${t("walkingMinutes")}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function RecommendationCategoryPanel({
  recommendations,
  category,
  translated,
}: {
  recommendations: PropertyRecommendation[];
  category: string;
  translated: TranslatablePayload | null;
}) {
  const { t } = useGuideLocale();
  const { descriptions: translatedDescriptions, isLoading: translationLoading } =
    useTranslatedRecommendations({
      category,
      recommendations,
      translated,
    });

  if (recommendations.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {t("recommendationsEmpty")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const distance = formatDistance(rec, t);
        return (
          <div
            key={rec.id}
            className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            {rec.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rec.photo_url}
                alt=""
                className="size-16 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              {rec.maps_url ? (
                <a
                  href={rec.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-serif text-lg font-bold underline-offset-2 hover:underline"
                >
                  {rec.name}
                  <ExternalLink size={14} strokeWidth={1.5} className="shrink-0" />
                </a>
              ) : (
                <p className="font-serif text-lg font-bold">{rec.name}</p>
              )}
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {distance && <span>{distance}</span>}
                {rec.rating != null && (
                  <span className="inline-flex items-center gap-0.5">
                    <Star size={12} strokeWidth={1.5} className="fill-current" />
                    {rec.rating}
                  </span>
                )}
              </div>
              {rec.address && <p className="mt-1 text-xs text-muted-foreground">{rec.address}</p>}
              {rec.description &&
                (translationLoading && !translatedDescriptions[rec.id] ? (
                  <div className="mt-1.5 space-y-1.5" aria-hidden="true">
                    <div className="h-3.5 w-full animate-pulse rounded bg-neutral-200" />
                    <div className="h-3.5 w-2/3 animate-pulse rounded bg-neutral-200" />
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm">{translatedDescriptions[rec.id] ?? rec.description}</p>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
