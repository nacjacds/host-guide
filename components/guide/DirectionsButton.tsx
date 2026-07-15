"use client";

import { Navigation } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";

export function DirectionsButton({ address }: { address: string }) {
  const { t } = useGuideLocale();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-[rgba(27,79,114,0.6)] px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-[rgba(27,79,114,0.75)]"
    >
      <Navigation className="size-3.5" strokeWidth={2} />
      {t("directions")}
    </a>
  );
}
