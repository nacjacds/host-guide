import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
      <h1 className="text-2xl font-semibold">Configuración de {property.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personalización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="accent_color">Color de la guía</Label>
            <Input id="accent_color" type="color" defaultValue={property.accent_color} />
          </div>
          <div>
            <Label htmlFor="language">Idioma</Label>
            <Input id="language" defaultValue={property.language} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp (plan Pro)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsapp_number">Número de contacto directo</Label>
            <Input
              id="whatsapp_number"
              defaultValue={property.whatsapp_number ?? ""}
              placeholder="+34 600 000 000"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
