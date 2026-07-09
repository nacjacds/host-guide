import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertySettingsForm } from "@/components/editor/PropertySettingsForm";
import { DeletePropertyButton } from "@/components/editor/DeletePropertyButton";

export default async function PropertySettingsPage({
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

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PropertySettingsForm property={property} />
      <DeletePropertyButton propertyId={property.id} propertyName={property.name} />
    </div>
  );
}
