"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Property } from "@/types";

const WELCOME_MESSAGE_MAX = 500;

export function PropertySettingsForm({ property }: { property: Property }) {
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address ?? "");
  const [accentColor, setAccentColor] = useState(property.accent_color);
  const [language, setLanguage] = useState(property.language);
  const [whatsappNumber, setWhatsappNumber] = useState(property.whatsapp_number ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(property.welcome_message ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          accent_color: accentColor,
          language,
          whatsapp_number: whatsappNumber || null,
          welcome_message: welcomeMessage || null,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo guardar la configuración");
        return;
      }

      toast.success("Configuración guardada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos básicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del alojamiento</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            ¿Quieres importar estos datos desde Airbnb? Hazlo desde la pestaña{" "}
            <strong>Editor</strong> — ahí puedes revisar y confirmar cada dato antes de
            aplicarlo, en vez de sobrescribirlo directamente.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="accent_color">Color de la guía</Label>
            <Input
              id="accent_color"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="language">Idioma</Label>
            <Input
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensaje de bienvenida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            id="welcome_message"
            value={welcomeMessage}
            maxLength={WELCOME_MESSAGE_MAX}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Bienvenido a tu casa lejos de casa. Espero que disfrutes tu estancia..."
            rows={4}
          />
          <p className="text-right text-xs text-muted-foreground">
            {welcomeMessage.length}/{WELCOME_MESSAGE_MAX}
          </p>
          <p className="text-xs text-muted-foreground">
            Aparece justo debajo de la cabecera en la guía pública, antes de los bloques de
            contenido.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp del anfitrión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsapp_number">Número de contacto directo</Label>
            <Input
              id="whatsapp_number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+34 600 000 000"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Si lo configuras, aparecerá un botón &quot;Contactar con el
              anfitrión&quot; fijo en la guía pública.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
