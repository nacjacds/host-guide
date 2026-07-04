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
  custom: "Personalizado",
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
    <div className="flex flex-wrap gap-2">
      {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((type) => (
        <Button
          key={type}
          variant="outline"
          size="sm"
          disabled={creatingType !== null}
          onClick={() => handleCreate(type)}
        >
          {creatingType === type ? "Añadiendo..." : `+ ${BLOCK_TYPE_LABELS[type]}`}
        </Button>
      ))}
    </div>
  );
}
