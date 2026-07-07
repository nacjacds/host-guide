import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AIGenerateButton } from "@/components/editor/AIGenerateButton";
import { PropertyEditor } from "@/components/editor/PropertyEditor";
import { PropertyNav } from "@/components/editor/PropertyNav";

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

  const [{ data: blocks }, { data: recommendations }] = await Promise.all([
    supabase.from("guide_blocks").select("*").eq("property_id", id).order("order_index"),
    supabase
      .from("recommendations")
      .select("*")
      .eq("property_id", id)
      .order("order_index"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{property.name}</h1>
        <AIGenerateButton propertyId={property.id} />
      </div>

      <PropertyNav propertyId={id} active="edit" />

      <PropertyEditor
        property={property}
        initialBlocks={blocks ?? []}
        initialRecommendations={recommendations ?? []}
      />
    </div>
  );
}
