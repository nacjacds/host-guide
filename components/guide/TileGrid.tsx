"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuideLocale } from "./GuideLocaleProvider";
import { BlockTitle } from "./BlockTitle";
import { BLOCK_ICONS } from "@/lib/guide-icons";
import type { GuideBlock, Recommendation } from "@/types";

const TILE_CLASSES =
  "flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md sm:p-6";

export function TileGrid({
  slug,
  blocks,
  recommendations,
  accentColor,
}: {
  slug: string;
  blocks: GuideBlock[];
  recommendations: Recommendation[];
  accentColor: string;
}) {
  const { t } = useGuideLocale();

  const visibleBlocks = blocks
    .filter((b) => b.is_visible)
    .sort((a, b) => a.order_index - b.order_index);
  const hasRecommendations = recommendations.some((r) => r.is_visible);

  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-3 sm:gap-4 sm:px-6 lg:px-8">
      {visibleBlocks.map((block) => {
        const isEmergency = block.type === "emergencias";
        const Icon = BLOCK_ICONS[block.type];
        return (
          <Link key={block.id} href={`/guide/${slug}/${block.type}`}>
            <div
              className={cn(
                TILE_CLASSES,
                isEmergency ? "hover:border-destructive/60" : "hover:border-[var(--tile-accent)]"
              )}
              style={isEmergency ? undefined : ({ "--tile-accent": accentColor } as React.CSSProperties)}
            >
              <Icon
                size={32}
                strokeWidth={1.5}
                color={isEmergency ? undefined : accentColor}
                className={isEmergency ? "text-destructive" : undefined}
              />
              <span
                className={cn(
                  "text-[13px] font-medium text-neutral-700",
                  isEmergency && "text-destructive"
                )}
              >
                <BlockTitle block={block} />
              </span>
            </div>
          </Link>
        );
      })}
      {hasRecommendations && (
        <Link href={`/guide/${slug}/recomendaciones`}>
          <div
            className={cn(TILE_CLASSES, "hover:border-[var(--tile-accent)]")}
            style={{ "--tile-accent": accentColor } as React.CSSProperties}
          >
            <MapPin size={32} strokeWidth={1.5} color={accentColor} />
            <span className="text-[13px] font-medium text-neutral-700">
              {t("recommendationsTile")}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}
