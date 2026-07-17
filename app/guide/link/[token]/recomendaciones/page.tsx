import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuideSectionHeader } from "@/components/guide/GuideSectionHeader";
import { RecommendationsPanel } from "@/components/guide/RecommendationsPanel";
import { BackToGuideButton } from "@/components/guide/BackToGuideButton";
import { GuideUnavailable } from "@/components/guide/GuideUnavailable";
import { logAnalyticsEvent } from "@/lib/analytics";
import { resolveGuestLink } from "@/lib/guestLinks";

// Mirrors app/guide/[slug]/recomendaciones/page.tsx — same legacy
// supermarket/pharmacy/transport panel, resolved via a personalized
// guest-link token instead of a slug.
export default async function GuestLinkRecommendationsPage({
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
  const basePath = `/guide/link/${token}`;
  const supabase = await createClient();

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*")
    .eq("property_id", property.id)
    .eq("is_visible", true)
    .order("order_index");

  await logAnalyticsEvent(property.id, "section_viewed", "recomendaciones");

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <GuideSectionHeader
        basePath={basePath}
        propertyName={property.name}
        accentColor={property.accent_color}
        coverImageUrl={property.cover_image_url}
      />
      <div className="space-y-8 px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <RecommendationsPanel
          recommendations={recommendations ?? []}
          accentColor={property.accent_color}
        />
        <BackToGuideButton basePath={basePath} />
      </div>
    </div>
  );
}
