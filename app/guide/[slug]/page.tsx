import { notFound } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/guide/HeroSection";
import { WelcomeMessage } from "@/components/guide/WelcomeMessage";
import { TileGrid } from "@/components/guide/TileGrid";
import { EmptyGuideState } from "@/components/guide/EmptyGuideState";
import { logAnalyticsEvent } from "@/lib/analytics";
import { fetchPropertyTranslations, lookupTranslation } from "@/lib/translations/fetchTranslations";
import { TARGET_LOCALES } from "@/lib/translations/constants";

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!property) notFound();

  // profiles has no public/anon RLS select policy (only "own profile" for
  // authenticated users), so a real anonymous guest can't read the host's
  // name/avatar through the regular client — use service role here, it's
  // only exposing display data the host already made public in their guide.
  const serviceClient = createServiceRoleClient();

  const [{ data: blocks }, { data: recommendations }, { data: host }] = await Promise.all([
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
    serviceClient
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", property.host_id)
      .single(),
  ]);

  await logAnalyticsEvent(property.id, "guide_opened");

  const hasVisibleBlocks = (blocks ?? []).some((b) => b.is_visible);
  const hasVisibleRecommendations = (recommendations ?? []).some((r) => r.is_visible);
  const isEmpty = !hasVisibleBlocks && !hasVisibleRecommendations;

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
          accentColor={property.accent_color}
          translations={translations}
        />
      )}
    </div>
  );
}
