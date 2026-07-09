"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import type { RecommendationQuota } from "@/lib/recommendations/constants";
import type { Property } from "@/types";

const WELCOME_MESSAGE_MAX = 500;

export function PropertySettingsForm({
  property,
  recommendationQuota,
  upgradePlanLabel,
}: {
  property: Property;
  recommendationQuota: RecommendationQuota;
  upgradePlanLabel: string | null;
}) {
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address ?? "");
  const [accentColor, setAccentColor] = useState(property.accent_color);
  const [language, setLanguage] = useState(property.language);
  const [whatsappNumber, setWhatsappNumber] = useState(property.whatsapp_number ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(property.welcome_message ?? "");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);
  const [quota, setQuota] = useState(recommendationQuota);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const response = await fetch(
        `/api/properties/${property.id}/property-recommendations/regenerate`,
        { method: "POST" }
      );
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudieron regenerar las recomendaciones");
        return;
      }
      toast.success("Recomendaciones regeneradas");
      setConfirmRegenerateOpen(false);
      setQuota((prev) => ({
        ...prev,
        used: prev.used + 1,
        remaining: Math.max(0, prev.remaining - 1),
      }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de red");
    } finally {
      setRegenerating(false);
    }
  }

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
    <>
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

    <Card>
      <CardHeader>
        <CardTitle>Recomendaciones locales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Qué visitar, dónde comer, ocio nocturno, playas y naturaleza se generan
          automáticamente con datos reales de Google y se regeneran cada 90 días. Usa este
          botón para forzar una regeneración inmediata.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirmRegenerateOpen(true)}
          disabled={regenerating || quota.remaining <= 0}
        >
          {regenerating ? "Regenerando..." : "Regenerar recomendaciones"}
        </Button>
        {quota.remaining > 0 ? (
          <p className="text-xs text-muted-foreground">
            Te quedan {quota.remaining} de {quota.limit} regeneraciones manuales este mes.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sin regeneraciones disponibles este mes · Se restablecen el {quota.resetDateLabel}
            {upgradePlanLabel && (
              <>
                {" · "}
                <Link
                  href="/account"
                  className="text-primary underline underline-offset-2 hover:no-underline"
                >
                  Mejorar plan
                </Link>
              </>
            )}
          </p>
        )}
      </CardContent>
    </Card>

    <ConfirmDialog
      open={confirmRegenerateOpen}
      onOpenChange={setConfirmRegenerateOpen}
      title="¿Regenerar recomendaciones?"
      description="Esto reemplazará las recomendaciones generadas automáticamente. Los lugares añadidos manualmente no se verán afectados."
      onConfirm={handleRegenerate}
      loading={regenerating}
    />
    </>
  );
}
