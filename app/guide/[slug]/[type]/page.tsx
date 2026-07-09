import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuideSectionHeader } from "@/components/guide/GuideSectionHeader";
import { TilePanel } from "@/components/guide/TilePanel";
import { EmergencyPanel } from "@/components/guide/EmergencyPanel";
import { PlaceListPanel } from "@/components/guide/PlaceListPanel";
import { BlockImageCarousel } from "@/components/guide/BlockImageCarousel";
import { BlockTitle } from "@/components/guide/BlockTitle";
import { BackToGuideButton } from "@/components/guide/BackToGuideButton";
import { SectionHeading } from "@/components/guide/SectionHeading";
import { WifiPanel } from "@/components/guide/WifiPanel";
import { CheckinPanel } from "@/components/guide/CheckinPanel";
import { BLOCK_ICONS } from "@/lib/guide-icons";
import { logAnalyticsEvent } from "@/lib/analytics";
import { fetchPropertyTranslations, lookupTranslation } from "@/lib/translations/fetchTranslations";
import { TARGET_LOCALES } from "@/lib/translations/constants";
import type { TranslatablePayload } from "@/lib/translations/extract";
import type { BlockType } from "@/types";
import type { PlaceListContent } from "@/components/editor/blocks/PlaceListBlock";

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
  "restaurants",
  "drinks",
  "nightlife",
  "attractions",
];

const PLACE_LIST_TYPES: readonly BlockType[] = [
  "restaurants",
  "drinks",
  "nightlife",
  "attractions",
];

export default async function GuideBlockPage({
  params,
}: {
  params: Promise<{ slug: string; type: string }>;
}) {
  const { slug, type } = await params;

  if (!VALID_TYPES.includes(type as BlockType)) notFound();

  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!property) notFound();

  const { data: blocks } = await supabase
    .from("guide_blocks")
    .select("*")
    .eq("property_id", property.id)
    .eq("type", type as BlockType)
    .eq("is_visible", true)
    .order("order_index");

  if (!blocks || blocks.length === 0) notFound();

  await logAnalyticsEvent(property.id, "section_viewed", type);

  // Locale is guest-selected client-side (see GuideLocaleProvider), so the
  // server can't know in advance which language will be shown — fetching
  // the (only) target locale's translations here means switching languages
  // client-side is instant, with zero AI call on the guest's critical path.
  const translations = await fetchPropertyTranslations(property.id, TARGET_LOCALES[0]);

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <GuideSectionHeader
        slug={slug}
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
        <BackToGuideButton slug={slug} />
      </div>
    </div>
  );
}
