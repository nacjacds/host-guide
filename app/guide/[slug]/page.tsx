import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/guide/HeroSection";
import { WelcomeMessage } from "@/components/guide/WelcomeMessage";
import { TileGrid } from "@/components/guide/TileGrid";
import { GuestBookForm } from "@/components/guide/GuestBookForm";
import { logAnalyticsEvent } from "@/lib/analytics";

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
    supabase.from("profiles").select("full_name").eq("id", property.host_id).single(),
  ]);

  await logAnalyticsEvent(property.id, "guide_opened");

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <HeroSection property={property} />
      {property.welcome_message && (
        <WelcomeMessage message={property.welcome_message} hostName={host?.full_name ?? null} />
      )}
      <TileGrid
        slug={slug}
        blocks={blocks ?? []}
        recommendations={recommendations ?? []}
        accentColor={property.accent_color}
      />
      <GuestBookForm propertyId={property.id} accentColor={property.accent_color} />
    </div>
  );
}
