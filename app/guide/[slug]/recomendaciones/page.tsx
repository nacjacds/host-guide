import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuideSectionHeader } from "@/components/guide/GuideSectionHeader";
import { RecommendationsPanel } from "@/components/guide/RecommendationsPanel";
import { BackToGuideButton } from "@/components/guide/BackToGuideButton";
import { GuideUnavailable } from "@/components/guide/GuideUnavailable";
import { logAnalyticsEvent } from "@/lib/analytics";
import { classifyGuideAvailability } from "@/lib/properties";

export default async function GuideRecommendationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // No is_published filter — see app/guide/[slug]/page.tsx for why.
  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single();

  const availability = classifyGuideAvailability(property);
  if (availability === "not_found" || availability === "unpublished") notFound();
  if (availability === "deleted") return <GuideUnavailable />;
  if (!property) notFound();

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
        slug={slug}
        propertyName={property.name}
        accentColor={property.accent_color}
        coverImageUrl={property.cover_image_url}
      />
      <div className="space-y-8 px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <RecommendationsPanel
          recommendations={recommendations ?? []}
          accentColor={property.accent_color}
        />
        <BackToGuideButton slug={slug} />
      </div>
    </div>
  );
}
