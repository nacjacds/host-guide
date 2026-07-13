"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlaceImageUploader } from "./PlaceImageUploader";
import type { BlockImage, BlockType, PlaceEntry, PriceLevel } from "@/types";

export interface PlaceListContent {
  places: PlaceEntry[];
}

const PRICE_LEVELS: PriceLevel[] = ["€", "€€", "€€€"];

function emptyPlace(): PlaceEntry {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    address: "",
    distance_meters: null,
    maps_url: "",
    google_place_id: null,
  };
}

export function PlaceListBlock({
  blockId,
  blockType,
  content,
  onChange,
}: {
  blockId: string;
  blockType: BlockType;
  content: PlaceListContent;
  onChange: (content: PlaceListContent) => void;
}) {
  const t = useTranslations("dashboard.editor.blocks.placeList");
  const tCommon = useTranslations("dashboard.common");
  const places = content.places ?? [];
  const showPrice = blockType === "drinks";
  const [skippedImageIds, setSkippedImageIds] = useState<Set<string>>(new Set());

  function updatePlace(index: number, patch: Partial<PlaceEntry>) {
    const next = [...places];
    next[index] = { ...next[index], ...patch };
    onChange({ places: next });
  }

  function removePlace(index: number) {
    onChange({ places: places.filter((_, i) => i !== index) });
  }

  function addPlace() {
    onChange({ places: [...places, emptyPlace()] });
  }

  const lastPlace = places[places.length - 1];
  const canAddAnotherPlace =
    places.length === 0 ||
    (lastPlace.images?.length ?? 0) > 0 ||
    skippedImageIds.has(lastPlace.id);

  return (
    <div className="space-y-3">
      {places.map((place, i) => (
        <div key={place.id} className="space-y-2.5 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t("place", { n: i + 1 })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => removePlace(i)}>
              {tCommon("delete")}
            </Button>
          </div>

          <div>
            <Label>{t("name")}</Label>
            <Input
              value={place.name}
              onChange={(e) => updatePlace(i, { name: e.target.value })}
            />
          </div>

          <div>
            <Label>{t("description")}</Label>
            <Textarea
              value={place.description}
              onChange={(e) => updatePlace(i, { description: e.target.value })}
              placeholder={t("descriptionPlaceholder")}
            />
          </div>

          <div>
            <Label>{t("address")}</Label>
            <Input
              value={place.address}
              onChange={(e) => updatePlace(i, { address: e.target.value })}
            />
          </div>

          <div>
            <Label>{t("distance")}</Label>
            <Input
              type="number"
              min={0}
              value={place.distance_meters ?? ""}
              onChange={(e) =>
                updatePlace(i, {
                  distance_meters: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>

          <div>
            <Label>{t("mapsLink")}</Label>
            <Input
              value={place.maps_url}
              onChange={(e) => updatePlace(i, { maps_url: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </div>

          {showPrice && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t("price")}</Label>
                <Select
                  value={place.price_level ?? ""}
                  onValueChange={(value) =>
                    updatePlace(i, { price_level: (value || null) as PriceLevel | null })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("priceUndefined")} />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label>{t("placeId")}</Label>
            <Input
              value={place.google_place_id ?? ""}
              onChange={(e) => updatePlace(i, { google_place_id: e.target.value || null })}
              placeholder={t("placeIdPlaceholder")}
            />
          </div>

          <div className="space-y-2 border-t border-border pt-2.5">
            <PlaceImageUploader
              blockId={blockId}
              placeId={place.id}
              images={place.images ?? []}
              onUploaded={(images: BlockImage[]) => updatePlace(i, { images })}
              onCaptionChange={(images: BlockImage[]) => updatePlace(i, { images })}
            />
            {(place.images?.length ?? 0) === 0 && !skippedImageIds.has(place.id) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSkippedImageIds((prev) => new Set(prev).add(place.id))
                }
              >
                {t("skip")}
              </Button>
            )}
          </div>
        </div>
      ))}

      {canAddAnotherPlace && (
        <Button variant="secondary" size="sm" onClick={addPlace}>
          {t("addPlace")}
        </Button>
      )}
    </div>
  );
}
