"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  drinks: "Copas y bares",
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
  drinks: "🍷",
  custom: "📄",
  emergencias: "🆘",
};

// "drinks" is intentionally excluded here — hosts no longer create new
// drinks blocks from the toolbar, but existing ones keep working (the type
// stays valid in BLOCK_TYPE_LABELS/ICONS and everywhere else). "Dónde
// comer"/"Ocio nocturno"/"Qué visitar" moved to the AI-curated local
// recommendations engine (see PropertyRecommendationsSection) and are no
// longer toolbar-creatable guide_blocks.
const TOOLBAR_TYPES: BlockType[] = [
  "wifi",
  "checkin",
  "checkout",
  "rules",
  "parking",
  "appliances",
  "pool",
  "custom",
  "emergencias",
];

// Once one of these exists, the toolbar button stays permanently "added" —
// a property only ever needs a single wifi/checkin/checkout/emergencias block.
const FIXED_TYPES = new Set<BlockType>(["wifi", "checkin", "checkout", "emergencias"]);

export function BlockToolbar({
  propertyId,
  blocks,
  onCreated,
}: {
  propertyId: string;
  blocks: GuideBlock[];
  onCreated: (block: GuideBlock) => void;
}) {
  const [creatingType, setCreatingType] = useState<BlockType | null>(null);
  const existingTypes = new Set(blocks.map((b) => b.type));

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
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
      {TOOLBAR_TYPES.map((type) => {
        const added = existingTypes.has(type);
        const locked = added && FIXED_TYPES.has(type);
        return (
          <Button
            key={type}
            variant="outline"
            size="sm"
            disabled={creatingType !== null || locked}
            onClick={() => handleCreate(type)}
            className={cn(
              "shrink-0",
              added && "border-[#1B4F72] bg-[#1B4F72] text-white hover:bg-[#1B4F72] hover:text-white"
            )}
          >
            <span aria-hidden>{BLOCK_TYPE_ICONS[type]}</span>
            {creatingType === type ? "Añadiendo..." : BLOCK_TYPE_LABELS[type]}
            {added && <Check className="size-3.5" strokeWidth={2} />}
          </Button>
        );
      })}
    </div>
  );
}
