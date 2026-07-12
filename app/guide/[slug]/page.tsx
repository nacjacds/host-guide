import { notFound } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/guide/HeroSection";
import { WelcomeMessage } from "@/components/guide/WelcomeMessage";
import { TileGrid } from "@/components/guide/TileGrid";
import { EmptyGuideState } from "@/components/guide/EmptyGuideState";
import { GuideUnavailable } from "@/components/guide/GuideUnavailable";
import { logAnalyticsEvent } from "@/lib/analytics";
import { fetchPropertyTranslations, lookupTranslation } from "@/lib/translations/fetchTranslations";
import { TARGET_LOCALES } from "@/lib/translations/constants";
import { classifyGuideAvailability } from "@/lib/properties";

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // No is_published filter here — fetched unconditionally so a
  // soft-deleted property can be told apart from a genuinely-missing or
  // still-draft one and shown different messaging (see
  // lib/properties.ts's classifyGuideAvailability).
  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single();

  const availability = classifyGuideAvailability(property);
  if (availability === "not_found" || availability === "unpublished") notFound();
  if (availability === "deleted") return <GuideUnavailable />;
  if (!property) notFound();

  // profiles has no public/anon RLS select policy (only "own profile" for
  // authenticated users), so a real anonymous guest can't read the host's
  // name/avatar through the regular client — use service role here, it's
  // only exposing display data the host already made public in their guide.
  const serviceClient = createServiceRoleClient();

  const [{ data: blocks }, { data: recommendations }, { data: propertyRecommendations }, { data: host }] =
    await Promise.all([
      supabase
        .from("guide_blocks")
        .select("*")
        .eq("property_id", property.id)
        .order("order_index"),
      supabase
        .from("recommendations")
        .select("*")
        .eq("property_id", property.id)
        .order("order_index"),
      supabase
        .from("property_recommendations")
        .select("category")
        .eq("property_id", property.id),
      serviceClient
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", property.host_id)
        .single(),
    ]);

  await logAnalyticsEvent(property.id, "guide_opened");

  // Only show a category tile for categories that actually have at least
  // one place — covers both AI-curated and host-added manual entries, so a
  // manually-added beach recommendation still surfaces even if the AI
  // search itself found nothing nearby.
  const recommendationCategories = Array.from(
    new Set((propertyRecommendations ?? []).map((r) => r.category))
  );

  const hasVisibleBlocks = (blocks ?? []).some((b) => b.is_visible);
  const hasVisibleRecommendations = (recommendations ?? []).some((r) => r.is_visible);
  const isEmpty =
    !hasVisibleBlocks && !hasVisibleRecommendations && recommendationCategories.length === 0;

  // See app/guide/[slug]/[type]/page.tsx — locale is guest-selected
  // client-side, so both the welcome message and (for custom blocks) tile
  // titles are pre-fetched here regardless of which language ends up shown.
  const translations = await fetchPropertyTranslations(property.id, TARGET_LOCALES[0]);
  const translatedWelcomeMessage = lookupTranslation<string>(
    translations,
    "welcome_message",
    null
  );

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <HeroSection property={property} />
      {property.welcome_message && (
        <WelcomeMessage
          message={property.welcome_message}
          hostName={host?.full_name ?? null}
          hostAvatarUrl={host?.avatar_url ?? null}
          translated={translatedWelcomeMessage}
        />
      )}
      {isEmpty ? (
        <EmptyGuideState accentColor={property.accent_color} />
      ) : (
        <TileGrid
          slug={slug}
          blocks={blocks ?? []}
          recommendations={recommendations ?? []}
          recommendationCategories={recommendationCategories}
          accentColor={property.accent_color}
          translations={translations}
        />
      )}
    </div>
  );
}
