import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/guide/HeroSection";
import { TileGrid } from "@/components/guide/TileGrid";
import { ContactButtons } from "@/components/guide/ContactButtons";

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

  const { data: blocks } = await supabase
    .from("guide_blocks")
    .select("*")
    .eq("property_id", property.id)
    .order("order_index");

  return (
    <div className="mx-auto max-w-2xl pb-12">
      <HeroSection property={property} />
      <TileGrid blocks={blocks ?? []} />
      <ContactButtons property={property} />
    </div>
  );
}
