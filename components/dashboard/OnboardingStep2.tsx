"use client";

import { useState } from "react";
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

const DEFAULT_RULES = [
  "No se admiten fiestas ni eventos",
  "Prohibido fumar en el interior",
  "Respeta el descanso a partir de las 22:00",
];

export function OnboardingStep2({
  propertyId,
  onDone,
}: {
  propertyId: string;
  onDone: (blocks: GuideBlock[]) => void;
}) {
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
    rules: DEFAULT_RULES,
  });
  const [loading, setLoading] = useState(false);

  async function createBlock(type: string, content: Record<string, unknown>) {
    const response = await fetch(`/api/properties/${propertyId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
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
      toast.error(err instanceof Error ? err.message : "Error de red");
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
        <h1 className="text-2xl font-semibold">Añade la información esencial</h1>
        <p className="text-sm text-muted-foreground">
          Activa lo que necesites — puedes editarlo aquí mismo o más tarde en el editor.
        </p>
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
                <Label>Nombre de la red</Label>
                <Input
                  value={wifi.wifiNetwork ?? ""}
                  onChange={(e) => setWifi((prev) => ({ ...prev, wifiNetwork: e.target.value }))}
                />
              </div>
              <div>
                <Label>Contraseña</Label>
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
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={checkin.checkinTime ?? ""}
                  onChange={(e) =>
                    setCheckin((prev) => ({ ...prev, checkinTime: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Instrucciones</Label>
                <Textarea
                  value={checkin.checkinInstructions ?? ""}
                  onChange={(e) =>
                    setCheckin((prev) => ({ ...prev, checkinInstructions: e.target.value }))
                  }
                  placeholder="Cómo recoger las llaves, código de acceso..."
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
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={checkout.checkoutTime ?? ""}
                  onChange={(e) =>
                    setCheckout((prev) => ({ ...prev, checkoutTime: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Instrucciones</Label>
                <Textarea
                  value={checkout.checkoutInstructions ?? ""}
                  onChange={(e) =>
                    setCheckout((prev) => ({ ...prev, checkoutInstructions: e.target.value }))
                  }
                  placeholder="Dónde dejar las llaves, qué revisar antes de salir..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border p-3">
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">📋 Normas de la casa</span>
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
                    Eliminar
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRules((prev) => ({ ...prev, rules: [...(prev.rules ?? []), ""] }))}
              >
                + Añadir norma
              </Button>
            </div>
          )}
        </div>

        <Button className="w-full" onClick={handleContinue} disabled={loading}>
          {loading ? "Guardando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
