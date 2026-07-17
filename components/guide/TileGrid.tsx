"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuideLocale } from "./GuideLocaleProvider";
import { BlockTitle } from "./BlockTitle";
import { BLOCK_ICONS } from "@/lib/guide-icons";
import { RECOMMENDATION_CATEGORY_ICONS } from "@/lib/recommendations/constants";
import { lookupTranslation, type PropertyTranslations } from "@/lib/translations/lookup";
import type { TranslatablePayload } from "@/lib/translations/extract";
import type { GuideBlock, Recommendation, PropertyRecommendationCategory } from "@/types";
import type { GuideTranslationKey } from "@/lib/guide-i18n";

const TILE_CLASSES =
  "flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md sm:p-6";

export function TileGrid({
  basePath,
  blocks,
  recommendations,
  recommendationCategories,
  accentColor,
  translations,
}: {
  basePath: string;
  blocks: GuideBlock[];
  recommendations: Recommendation[];
  recommendationCategories: PropertyRecommendationCategory[];
  accentColor: string;
  translations: PropertyTranslations;
}) {
  const { t } = useGuideLocale();

  const visibleBlocks = blocks
    .filter((b) => b.is_visible)
    .sort((a, b) => a.order_index - b.order_index);
  const hasRecommendations = recommendations.some((r) => r.is_visible);

  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-3 sm:gap-4 sm:px-6 lg:px-8">
      {visibleBlocks.map((block) => {
        const Icon = BLOCK_ICONS[block.type];
        const translated = lookupTranslation<TranslatablePayload>(translations, block.type, block.id);
        return (
          <Link key={block.id} href={`${basePath}/${block.type}`}>
            <div
              className={cn(TILE_CLASSES, "hover:border-[var(--tile-accent)]")}
              style={{ "--tile-accent": accentColor } as React.CSSProperties}
            >
              <Icon size={32} strokeWidth={1.5} color={accentColor} />
              <span className="text-[13px] font-medium text-neutral-700">
                <BlockTitle block={block} translated={translated} />
              </span>
            </div>
          </Link>
        );
      })}
      {recommendationCategories.map((category) => {
        const Icon = RECOMMENDATION_CATEGORY_ICONS[category];
        return (
          <Link key={category} href={`${basePath}/${category}`}>
            <div
              className={cn(TILE_CLASSES, "hover:border-[var(--tile-accent)]")}
              style={{ "--tile-accent": accentColor } as React.CSSProperties}
            >
              <Icon size={32} strokeWidth={1.5} color={accentColor} />
              <span className="text-[13px] font-medium text-neutral-700">
                {t(`block_${category}` as GuideTranslationKey)}
              </span>
            </div>
          </Link>
        );
      })}
      {hasRecommendations && (
        <Link href={`${basePath}/recomendaciones`}>
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
