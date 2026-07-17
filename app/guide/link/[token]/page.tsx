import { notFound } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/guide/HeroSection";
import { WelcomeMessage } from "@/components/guide/WelcomeMessage";
import { TileGrid } from "@/components/guide/TileGrid";
import { EmptyGuideState } from "@/components/guide/EmptyGuideState";
import { GuideUnavailable } from "@/components/guide/GuideUnavailable";
import { logAnalyticsEvent } from "@/lib/analytics";
import { fetchPropertyTranslations, lookupTranslation } from "@/lib/translations/fetchTranslations";
import { guideTargetLocaleFor, resolvePropertySourceLocale } from "@/lib/translations/constants";
import { resolveGuestLink } from "@/lib/guestLinks";

// Mirrors app/guide/[slug]/page.tsx — same content, resolved via a
// personalized guest-link token instead of the property's slug. See
// lib/guestLinks.ts for the shared not_found/unpublished/deleted/expired
// classification.
export default async function GuestLinkGuidePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const resolution = await resolveGuestLink(token);

  if (resolution.status === "not_found" || resolution.status === "unpublished") notFound();
  if (resolution.status === "deleted") return <GuideUnavailable />;
  if (resolution.status === "expired") return <GuideUnavailable variant="link_expired" />;

  const property = resolution.property!;
  const supabase = await createClient();
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

  const recommendationCategories = Array.from(
    new Set((propertyRecommendations ?? []).map((r) => r.category))
  );

  const hasVisibleBlocks = (blocks ?? []).some((b) => b.is_visible);
  const hasVisibleRecommendations = (recommendations ?? []).some((r) => r.is_visible);
  const isEmpty =
    !hasVisibleBlocks && !hasVisibleRecommendations && recommendationCategories.length === 0;

  const sourceLocale = resolvePropertySourceLocale(property.language);
  const translations = await fetchPropertyTranslations(property.id, guideTargetLocaleFor(sourceLocale));
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
          basePath={`/guide/link/${token}`}
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
