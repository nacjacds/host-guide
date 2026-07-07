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
import type { BlockType, PlaceEntry, PriceLevel } from "@/types";

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
  blockType,
  content,
  onChange,
}: {
  blockType: BlockType;
  content: PlaceListContent;
  onChange: (content: PlaceListContent) => void;
}) {
  const places = content.places ?? [];
  const showCuisine = blockType === "restaurants";
  const showPrice = blockType === "restaurants" || blockType === "drinks";

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

  return (
    <div className="space-y-3">
      {places.map((place, i) => (
        <div key={place.id} className="space-y-2.5 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Lugar {i + 1}</span>
            <Button variant="ghost" size="sm" onClick={() => removePlace(i)}>
              Eliminar
            </Button>
          </div>

          <div>
            <Label>Nombre</Label>
            <Input
              value={place.name}
              onChange={(e) => updatePlace(i, { name: e.target.value })}
            />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={place.description}
              onChange={(e) => updatePlace(i, { description: e.target.value })}
              placeholder="2 frases sobre qué hace especial a este sitio"
            />
          </div>

          <div>
            <Label>Dirección</Label>
            <Input
              value={place.address}
              onChange={(e) => updatePlace(i, { address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Distancia (metros)</Label>
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
              <Label>Enlace de Google Maps</Label>
              <Input
                value={place.maps_url}
                onChange={(e) => updatePlace(i, { maps_url: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          {(showCuisine || showPrice) && (
            <div className="grid grid-cols-2 gap-2">
              {showCuisine && (
                <div>
                  <Label>Tipo de cocina</Label>
                  <Input
                    value={place.cuisine_type ?? ""}
                    onChange={(e) => updatePlace(i, { cuisine_type: e.target.value })}
                    placeholder="Mariscos, Tapas..."
                  />
                </div>
              )}
              {showPrice && (
                <div>
                  <Label>Precio</Label>
                  <Select
                    value={place.price_level ?? ""}
                    onValueChange={(value) =>
                      updatePlace(i, { price_level: (value || null) as PriceLevel | null })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin definir" />
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
              )}
            </div>
          )}

          <div>
            <Label>ID de Google Places (opcional)</Label>
            <Input
              value={place.google_place_id ?? ""}
              onChange={(e) => updatePlace(i, { google_place_id: e.target.value || null })}
              placeholder="Se rellenará automáticamente en el futuro"
            />
          </div>
        </div>
      ))}

      <Button variant="secondary" size="sm" onClick={addPlace}>
        + Añadir lugar
      </Button>
    </div>
  );
}
