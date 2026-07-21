"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ALL_APP_LOCALES, parseLocale, type AppLocale } from "@/lib/locale";
import type { DestinationType, Property } from "@/types";

const WELCOME_MESSAGE_MAX = 500;
const DESTINATION_TYPES: DestinationType[] = ["urban", "historic_city", "beach", "nature", "rural"];

export function PropertySettingsForm({ property }: { property: Property }) {
  const t = useTranslations("dashboard.editor.settings");
  const tCommon = useTranslations("dashboard.common");
  const tDestinationTypes = useTranslations("dashboard.destinationTypes");
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address ?? "");
  const [destinationType, setDestinationType] = useState<DestinationType>(
    property.destination_type as DestinationType
  );
  const [accentColor, setAccentColor] = useState(property.accent_color);
  const [whatsappNumber, setWhatsappNumber] = useState(property.whatsapp_number ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(property.welcome_message ?? "");
  const [language, setLanguage] = useState<AppLocale>(parseLocale(property.language));
  const [saving, setSaving] = useState(false);

  const contentLanguageNames: Record<AppLocale, string> = {
    es: t("contentLanguageEs"),
    en: t("contentLanguageEn"),
    fr: t("contentLanguageFr"),
    it: t("contentLanguageIt"),
    pt: t("contentLanguagePt"),
  };

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
          language,
          destination_type: destinationType,
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
          <div>
            <Label htmlFor="destination_type">{tDestinationTypes("label")}</Label>
            <Select
              value={destinationType}
              onValueChange={(value) => setDestinationType(value as DestinationType)}
            >
              <SelectTrigger id="destination_type" className="w-full">
                <SelectValue>{(value: DestinationType) => tDestinationTypes(value)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DESTINATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {tDestinationTypes(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">{tDestinationTypes("hint")}</p>
          </div>
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
          <CardTitle>{t("contentLanguageTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label htmlFor="content_language">{t("contentLanguageLabel")}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as AppLocale)}>
              <SelectTrigger id="content_language" className="w-48">
                <SelectValue>{(value: AppLocale) => contentLanguageNames[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ALL_APP_LOCALES.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    {contentLanguageNames[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">{t("contentLanguageWarning")}</p>
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
