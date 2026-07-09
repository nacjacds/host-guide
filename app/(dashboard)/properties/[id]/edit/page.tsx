import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyEditor } from "@/components/editor/PropertyEditor";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) notFound();

  const { data: blocks } = await supabase
    .from("guide_blocks")
    .select("*")
    .eq("property_id", id)
    .order("order_index");

  const { data: recommendations } = await supabase
    .from("property_recommendations")
    .select("*")
    .eq("property_id", id)
    .order("display_order");

  return (
    <PropertyEditor
      property={property}
      initialBlocks={blocks ?? []}
      initialRecommendations={recommendations ?? []}
    />
  );
}
