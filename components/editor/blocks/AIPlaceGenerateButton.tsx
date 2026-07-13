"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildGoogleMapsUrl } from "@/lib/utils";
import type { PlaceEntry } from "@/types";

interface PlaceSuggestion {
  name: string;
  description: string;
  address: string;
  distance_meters: number | null;
}

export function AIPlaceGenerateButton({
  blockId,
  onGenerated,
}: {
  blockId: string;
  onGenerated: (place: PlaceEntry) => void;
}) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("dashboard.editor.blocks.aiGenerate");

  async function handleGenerate() {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("error"));
        return;
      }

      const { suggestion } = (await response.json()) as { suggestion: PlaceSuggestion };
      onGenerated({
        id: crypto.randomUUID(),
        name: suggestion.name,
        description: suggestion.description,
        address: suggestion.address,
        distance_meters: suggestion.distance_meters,
        maps_url: buildGoogleMapsUrl(suggestion.name, suggestion.address),
        google_place_id: null,
      });
      toast.success(t("suggested"));
    } catch {
      toast.error(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
      <Sparkles className="size-3.5" strokeWidth={1.5} />
      {loading ? t("generating") : t("generate")}
    </Button>
  );
}
