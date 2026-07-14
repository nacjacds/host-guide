"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/components/shared/LocaleProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { GuideBlock } from "@/types";

interface SuggestedBlockState {
  enabled: boolean;
  wifiNetwork?: string;
  wifiPassword?: string;
  checkinTime?: string;
  checkinInstructions?: string;
  checkoutTime?: string;
  checkoutInstructions?: string;
  rules?: string[];
}

export function OnboardingStep2({
  propertyId,
  onDone,
}: {
  propertyId: string;
  onDone: (blocks: GuideBlock[]) => void;
}) {
  const t = useTranslations("dashboard.onboarding.step2");
  const tCommon = useTranslations("dashboard.common");
  const tRules = useTranslations("dashboard.editor.blocks.rules");
  const { locale } = useLocale();
  const [wifi, setWifi] = useState<SuggestedBlockState>({ enabled: true });
  const [checkin, setCheckin] = useState<SuggestedBlockState>({
    enabled: true,
    checkinTime: "16:00",
  });
  const [checkout, setCheckout] = useState<SuggestedBlockState>({
    enabled: true,
    checkoutTime: "11:00",
  });
  const [rules, setRules] = useState<SuggestedBlockState>({
    enabled: true,
    rules: t.raw("defaultRules") as string[],
  });
  const [loading, setLoading] = useState(false);

  async function createBlock(type: string, content: Record<string, unknown>) {
    const response = await fetch(`/api/properties/${propertyId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, locale }),
    });
    if (!response.ok) return null;
    const { block } = await response.json();

    const patchResponse = await fetch(`/api/guide-blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!patchResponse.ok) return block;
    const { block: updated } = await patchResponse.json();
    return updated ?? block;
  }

  async function handleContinue() {
    setLoading(true);
    try {
      const created: GuideBlock[] = [];

      if (wifi.enabled) {
        const block = await createBlock("wifi", {
          network_name: wifi.wifiNetwork ?? "",
          password: wifi.wifiPassword ?? "",
        });
        if (block) created.push(block);
      }
      if (checkin.enabled) {
        const block = await createBlock("checkin", {
          time: checkin.checkinTime ?? "",
          instructions: checkin.checkinInstructions ?? "",
        });
        if (block) created.push(block);
      }
      if (checkout.enabled) {
        const block = await createBlock("checkout", {
          time: checkout.checkoutTime ?? "",
          instructions: checkout.checkoutInstructions ?? "",
        });
        if (block) created.push(block);
      }
      if (rules.enabled) {
        const block = await createBlock("rules", {
          rules: (rules.rules ?? []).filter((r) => r.trim().length > 0),
        });
        if (block) created.push(block);
      }

      onDone(created);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon("networkError"));
    } finally {
      setLoading(false);
    }
  }

  function updateRule(index: number, value: string) {
    setRules((prev) => {
      const next = [...(prev.rules ?? [])];
      next[index] = value;
      return { ...prev, rules: next };
    });
  }

  function removeRule(index: number) {
    setRules((prev) => ({ ...prev, rules: (prev.rules ?? []).filter((_, i) => i !== index) }));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mx-auto max-w-sm space-y-4">
        <div className="rounded-lg border border-border p-3">
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">📶 WiFi</span>
            <Switch
              checked={wifi.enabled}
              onCheckedChange={(checked) => setWifi((prev) => ({ ...prev, enabled: checked }))}
            />
          </label>
          {wifi.enabled && (
            <div className="mt-3 space-y-2">
              <div>
                <Label>{t("networkName")}</Label>
                <Input
                  value={wifi.wifiNetwork ?? ""}
                  onChange={(e) => setWifi((prev) => ({ ...prev, wifiNetwork: e.target.value }))}
                />
              </div>
              <div>
                <Label>{t("password")}</Label>
                <Input
                  value={wifi.wifiPassword ?? ""}
                  onChange={(e) => setWifi((prev) => ({ ...prev, wifiPassword: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border p-3">
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">🔑 Check-in</span>
            <Switch
              checked={checkin.enabled}
              onCheckedChange={(checked) => setCheckin((prev) => ({ ...prev, enabled: checked }))}
            />
          </label>
          {checkin.enabled && (
            <div className="mt-3 space-y-2">
              <div>
                <Label>{t("time")}</Label>
                <Input
                  type="time"
                  value={checkin.checkinTime ?? ""}
                  onChange={(e) =>
                    setCheckin((prev) => ({ ...prev, checkinTime: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>{t("instructions")}</Label>
                <Textarea
                  value={checkin.checkinInstructions ?? ""}
                  onChange={(e) =>
                    setCheckin((prev) => ({ ...prev, checkinInstructions: e.target.value }))
                  }
                  placeholder={t("checkinInstructionsPlaceholder")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border p-3">
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">🚪 Check-out</span>
            <Switch
              checked={checkout.enabled}
              onCheckedChange={(checked) =>
                setCheckout((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </label>
          {checkout.enabled && (
            <div className="mt-3 space-y-2">
              <div>
                <Label>{t("time")}</Label>
                <Input
                  type="time"
                  value={checkout.checkoutTime ?? ""}
                  onChange={(e) =>
                    setCheckout((prev) => ({ ...prev, checkoutTime: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>{t("instructions")}</Label>
                <Textarea
                  value={checkout.checkoutInstructions ?? ""}
                  onChange={(e) =>
                    setCheckout((prev) => ({ ...prev, checkoutInstructions: e.target.value }))
                  }
                  placeholder={t("checkoutInstructionsPlaceholder")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border p-3">
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">📋 {t("rulesLabel")}</span>
            <Switch
              checked={rules.enabled}
              onCheckedChange={(checked) => setRules((prev) => ({ ...prev, enabled: checked }))}
            />
          </label>
          {rules.enabled && (
            <div className="mt-3 space-y-2">
              {(rules.rules ?? []).map((rule, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={rule} onChange={(e) => updateRule(i, e.target.value)} />
                  <Button variant="ghost" size="sm" onClick={() => removeRule(i)}>
                    {tCommon("delete")}
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRules((prev) => ({ ...prev, rules: [...(prev.rules ?? []), ""] }))}
              >
                + {tRules("addRule")}
              </Button>
            </div>
          )}
        </div>

        <Button className="w-full" onClick={handleContinue} disabled={loading}>
          {loading ? tCommon("saving") : t("continue")}
        </Button>
      </div>
    </div>
  );
}
