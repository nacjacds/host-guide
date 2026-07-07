"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { BlockType, GuideBlock } from "@/types";

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  wifi: "WiFi",
  checkin: "Check-in",
  checkout: "Check-out",
  rules: "Normas",
  parking: "Parking",
  appliances: "Electrodomésticos",
  pool: "Piscina",
  restaurants: "Dónde comer",
  drinks: "Copas y bares",
  nightlife: "Ocio nocturno",
  attractions: "Qué visitar",
  custom: "Personalizado",
  emergencias: "Emergencias",
};

const BLOCK_TYPE_ICONS: Record<BlockType, string> = {
  wifi: "📶",
  checkin: "🔑",
  checkout: "🚪",
  rules: "📋",
  parking: "🅿️",
  appliances: "🔌",
  pool: "🏊",
  restaurants: "🍽️",
  drinks: "🍷",
  nightlife: "🎵",
  attractions: "🏛️",
  custom: "📄",
  emergencias: "🆘",
};

export function BlockToolbar({
  propertyId,
  onCreated,
}: {
  propertyId: string;
  onCreated: (block: GuideBlock) => void;
}) {
  const [creatingType, setCreatingType] = useState<BlockType | null>(null);

  async function handleCreate(type: BlockType) {
    setCreatingType(type);
    try {
      const response = await fetch(`/api/properties/${propertyId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo crear el bloque");
        return;
      }

      const { block } = await response.json();
      onCreated(block);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de red");
    } finally {
      setCreatingType(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((type) => (
        <Button
          key={type}
          variant="outline"
          size="sm"
          disabled={creatingType !== null}
          onClick={() => handleCreate(type)}
        >
          <span aria-hidden>{BLOCK_TYPE_ICONS[type]}</span>
          {creatingType === type ? "Añadiendo..." : BLOCK_TYPE_LABELS[type]}
        </Button>
      ))}
    </div>
  );
}
