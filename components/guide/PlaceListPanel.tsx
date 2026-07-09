"use client";

import { ExternalLink } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";
import { useTranslatedBlock } from "./useTranslatedBlock";
import type { TranslatablePayload } from "@/lib/translations/extract";
import type { PlaceListContent } from "@/components/editor/blocks/PlaceListBlock";
import type { GuideBlock, PlaceEntry } from "@/types";

function formatDistance(meters: number | null): string | null {
  if (meters === null) return null;
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function PlaceCard({ place, accentColor }: { place: PlaceEntry; accentColor: string }) {
  const { t } = useGuideLocale();
  const distance = formatDistance(place.distance_meters);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-serif text-lg font-bold">{place.name}</p>
        {place.price_level && (
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {place.price_level}
          </span>
        )}
      </div>
      {(place.cuisine_type || place.address || distance) && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {[place.cuisine_type, place.address, distance].filter(Boolean).join(" · ")}
        </p>
      )}
      {place.description && <p className="mt-2 text-sm">{place.description}</p>}
      {place.maps_url && (
        <a
          href={place.maps_url}
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
  );
}

export function PlaceListPanel({
  block,
  content,
  accentColor,
  translated,
}: {
  block: GuideBlock;
  content: PlaceListContent;
  accentColor: string;
  translated: TranslatablePayload | null;
}) {
  const { content: mergedContent } = useTranslatedBlock({
    blockType: block.type,
    blockId: block.id,
    content: content as unknown as Record<string, unknown>,
    translated,
  });
  const places = ((mergedContent as unknown as PlaceListContent).places ?? []) as PlaceEntry[];

  const sorted = [...places].sort((a, b) => {
    if (a.distance_meters === null) return 1;
    if (b.distance_meters === null) return -1;
    return a.distance_meters - b.distance_meters;
  });

  return (
    <div className="space-y-3">
      {sorted.map((place) => (
        <PlaceCard key={place.id} place={place} accentColor={accentColor} />
      ))}
    </div>
  );
}
