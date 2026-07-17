import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuideSectionHeader } from "@/components/guide/GuideSectionHeader";
import { TilePanel } from "@/components/guide/TilePanel";
import { EmergencyPanel } from "@/components/guide/EmergencyPanel";
import { PlaceListPanel } from "@/components/guide/PlaceListPanel";
import { RecommendationCategoryPanel } from "@/components/guide/RecommendationCategoryPanel";
import { RecommendationCategoryTitle } from "@/components/guide/RecommendationCategoryTitle";
import { BlockImageCarousel } from "@/components/guide/BlockImageCarousel";
import { BlockTitle } from "@/components/guide/BlockTitle";
import { BackToGuideButton } from "@/components/guide/BackToGuideButton";
import { SectionHeading } from "@/components/guide/SectionHeading";
import { WifiPanel } from "@/components/guide/WifiPanel";
import { CheckinPanel } from "@/components/guide/CheckinPanel";
import { GuideUnavailable } from "@/components/guide/GuideUnavailable";
import { BLOCK_ICONS } from "@/lib/guide-icons";
import { RECOMMENDATION_CATEGORY_ICONS } from "@/lib/recommendations/constants";
import { logAnalyticsEvent } from "@/lib/analytics";
import { fetchPropertyTranslations, lookupTranslation } from "@/lib/translations/fetchTranslations";
import {
  guideTargetLocaleFor,
  resolvePropertySourceLocale,
  RECOMMENDATIONS_TARGET_LOCALE,
} from "@/lib/translations/constants";
import { resolveGuestLink } from "@/lib/guestLinks";
import type { TranslatablePayload } from "@/lib/translations/extract";
import type { BlockType, PropertyRecommendationCategory } from "@/types";
import type { PlaceListContent } from "@/components/editor/blocks/PlaceListBlock";

// Mirrors app/guide/[slug]/[type]/page.tsx — same content, resolved via a
// personalized guest-link token instead of a slug.
const VALID_TYPES: readonly BlockType[] = [
  "wifi",
  "checkin",
  "checkout",
  "rules",
  "parking",
  "appliances",
  "custom",
  "emergencias",
  "pool",
  "drinks",
];

const PLACE_LIST_TYPES: readonly BlockType[] = ["drinks"];

const RECOMMENDATION_TYPES: readonly PropertyRecommendationCategory[] = [
  "attractions",
  "restaurants",
  "nightlife",
  "beaches",
  "nature",
];

export default async function GuestLinkBlockPage({
  params,
}: {
  params: Promise<{ token: string; type: string }>;
}) {
  const { token, type } = await params;

  const isRecommendationCategory = RECOMMENDATION_TYPES.includes(
    type as PropertyRecommendationCategory
  );

  if (!VALID_TYPES.includes(type as BlockType) && !isRecommendationCategory) notFound();

  const resolution = await resolveGuestLink(token);
  if (resolution.status === "not_found" || resolution.status === "unpublished") notFound();
  if (resolution.status === "deleted") return <GuideUnavailable />;
  if (resolution.status === "expired") return <GuideUnavailable variant="link_expired" />;

  const property = resolution.property!;
  const basePath = `/guide/link/${token}`;
  const supabase = await createClient();

  if (isRecommendationCategory) {
    const category = type as PropertyRecommendationCategory;
    const { data: recommendations } = await supabase
      .from("property_recommendations")
      .select("*")
      .eq("property_id", property.id)
      .eq("category", category)
      .order("display_order");

    if (!recommendations || recommendations.length === 0) notFound();

    await logAnalyticsEvent(property.id, "section_viewed", type);

    const Icon = RECOMMENDATION_CATEGORY_ICONS[category];

    const translations = await fetchPropertyTranslations(property.id, RECOMMENDATIONS_TARGET_LOCALE);
    const translated = lookupTranslation<TranslatablePayload>(translations, category, null);

    return (
      <div className="mx-auto max-w-2xl pb-24">
        <GuideSectionHeader
          basePath={basePath}
          propertyName={property.name}
          accentColor={property.accent_color}
          coverImageUrl={property.cover_image_url}
        />
        <div className="space-y-8 px-4 pt-8 pb-6 sm:px-6 lg:px-8">
          <div>
            <SectionHeading icon={Icon} accentColor={property.accent_color}>
              <RecommendationCategoryTitle category={category} />
            </SectionHeading>
            <RecommendationCategoryPanel
              recommendations={recommendations}
              category={category}
              translated={translated}
            />
          </div>
          <BackToGuideButton basePath={basePath} />
        </div>
      </div>
    );
  }

  const { data: blocks } = await supabase
    .from("guide_blocks")
    .select("*")
    .eq("property_id", property.id)
    .eq("type", type as BlockType)
    .eq("is_visible", true)
    .order("order_index");

  if (!blocks || blocks.length === 0) notFound();

  await logAnalyticsEvent(property.id, "section_viewed", type);

  const sourceLocale = resolvePropertySourceLocale(property.language);
  const translations = await fetchPropertyTranslations(property.id, guideTargetLocaleFor(sourceLocale));

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <GuideSectionHeader
        basePath={basePath}
        propertyName={property.name}
        accentColor={property.accent_color}
        coverImageUrl={property.cover_image_url}
      />
      <div className="space-y-8 px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        {blocks.map((block) => {
          const isEmergency = block.type === "emergencias";
          const isWifi = block.type === "wifi";
          const isCheckin = block.type === "checkin" || block.type === "checkout";
          const isPlaceList = PLACE_LIST_TYPES.includes(block.type);
          const translated = lookupTranslation<TranslatablePayload>(translations, block.type, block.id);
          return (
            <div key={block.id}>
              <SectionHeading
                icon={BLOCK_ICONS[block.type]}
                accentColor={property.accent_color}
                isDestructive={isEmergency}
              >
                <BlockTitle block={block} translated={translated} />
              </SectionHeading>
              <div className="space-y-4">
                <BlockImageCarousel images={block.images} />
                {isEmergency ? (
                  <EmergencyPanel block={block} translated={translated} />
                ) : isWifi ? (
                  <WifiPanel
                    block={block}
                    accentColor={property.accent_color}
                    propertyId={property.id}
                  />
                ) : isCheckin ? (
                  <CheckinPanel block={block} translated={translated} />
                ) : isPlaceList ? (
                  <PlaceListPanel
                    block={block}
                    content={block.content as unknown as PlaceListContent}
                    accentColor={property.accent_color}
                    translated={translated}
                  />
                ) : (
                  <TilePanel block={block} accentColor={property.accent_color} translated={translated} />
                )}
              </div>
            </div>
          );
        })}
        <BackToGuideButton basePath={basePath} />
      </div>
    </div>
  );
}
