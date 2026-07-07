import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuideSectionHeader } from "@/components/guide/GuideSectionHeader";
import { RecommendationsPanel } from "@/components/guide/RecommendationsPanel";
import { BackToGuideButton } from "@/components/guide/BackToGuideButton";
import { logAnalyticsEvent } from "@/lib/analytics";

export default async function GuideRecommendationsPage({
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
