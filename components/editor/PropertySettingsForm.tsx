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
  const [airbnbUrl, setAirbnbUrl] = useState(property.airbnb_url ?? "");
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

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
          airbnb_url: airbnbUrl || null,
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

  async function handleImportAirbnb() {
    if (!airbnbUrl) return;
    setImporting(true);
    try {
      const response = await fetch("/api/properties/import-airbnb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: airbnbUrl }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.error ?? "No se pudo importar el anuncio. Rellena los datos manualmente.");
        return;
      }

      if (data.title) setName(data.title);
      if (data.address) setAddress(data.address);
      if (data.description) setWelcomeMessage(data.description.slice(0, WELCOME_MESSAGE_MAX));
      toast.success("Datos importados — revísalos y pulsa \"Guardar cambios\".");
    } catch {
      toast.error("Error de red al importar. Rellena los datos manualmente.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar desde Airbnb</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="airbnb_url">URL de tu anuncio de Airbnb</Label>
          <div className="flex gap-2">
            <Input
              id="airbnb_url"
              value={airbnbUrl}
              onChange={(e) => setAirbnbUrl(e.target.value)}
              placeholder="https://www.airbnb.com/rooms/12345678"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleImportAirbnb}
              disabled={importing || !airbnbUrl}
            >
              {importing ? "Importando..." : "Importar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Best-effort: leemos la información pública del anuncio (título, descripción y
            ubicación aproximada) y la volcamos abajo para que la revises antes de guardar.
            Airbnb puede bloquear esta importación — si falla, rellena los campos a mano.
          </p>
        </CardContent>
      </Card>

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
