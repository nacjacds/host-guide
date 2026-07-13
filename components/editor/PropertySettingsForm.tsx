"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Property } from "@/types";

const WELCOME_MESSAGE_MAX = 500;

export function PropertySettingsForm({ property }: { property: Property }) {
  const t = useTranslations("dashboard.editor.settings");
  const tCommon = useTranslations("dashboard.common");
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address ?? "");
  const [accentColor, setAccentColor] = useState(property.accent_color);
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
          whatsapp_number: whatsappNumber || null,
          welcome_message: welcomeMessage || null,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("saveError"));
        return;
      }

      toast.success(t("saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon("networkError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("basicData")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">{t("propertyName")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="address">{t("address")}</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("importHintPrefix")} <strong>{t("importHintTab")}</strong> — {t("importHintSuffix")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("customization")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="accent_color">{t("guideColor")}</Label>
            <Input
              id="accent_color"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("welcomeMessage")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            id="welcome_message"
            value={welcomeMessage}
            maxLength={WELCOME_MESSAGE_MAX}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder={t("welcomeMessagePlaceholder")}
            rows={4}
          />
          <p className="text-right text-xs text-muted-foreground">
            {welcomeMessage.length}/{WELCOME_MESSAGE_MAX}
          </p>
          <p className="text-xs text-muted-foreground">{t("welcomeMessageHint")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("whatsappTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsapp_number">{t("whatsappNumberLabel")}</Label>
            <Input
              id="whatsapp_number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+34 600 000 000"
            />
            <p className="mt-1 text-xs text-muted-foreground">{t("whatsappHint")}</p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving}>
        {saving ? tCommon("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
