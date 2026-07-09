"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  BASE_RECOMMENDATION_CATEGORIES,
  OPTIONAL_RECOMMENDATION_CATEGORIES,
  RECOMMENDATION_CATEGORY_LABELS,
  RECOMMENDATION_CATEGORY_ICONS,
} from "@/lib/recommendations/constants";
import type { PropertyRecommendation, PropertyRecommendationCategory } from "@/types";

const ALL_CATEGORIES = [...BASE_RECOMMENDATION_CATEGORIES, ...OPTIONAL_RECOMMENDATION_CATEGORIES];

function formatDistance(rec: PropertyRecommendation): string | null {
  if (rec.distance_meters == null) return null;
  return rec.distance_meters < 1000
    ? `${rec.distance_meters}m`
    : `${(rec.distance_meters / 1000).toFixed(1)}km`;
}

function AddPlaceSearch({
  propertyId,
  category,
  onAdded,
}: {
  propertyId: string;
  category: PropertyRecommendationCategory;
  onAdded: (rec: PropertyRecommendation) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ place_id: string; description: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(query)}&propertyId=${propertyId}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const { suggestions } = await response.json();
          setSuggestions(suggestions ?? []);
        }
      } catch {
        // Ignore — aborted or network error, the input just stays as typed.
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, propertyId]);

  async function handleSelect(placeId: string) {
    setAdding(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/property-recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, place_id: placeId }),
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo añadir el lugar");
        return;
      }
      const { recommendation } = await response.json();
      onAdded(recommendation);
      setQuery("");
      setSuggestions([]);
      toast.success("Lugar añadido");
    } catch {
      toast.error("Error de red");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="relative">
      <Input
        placeholder="Buscar un lugar para añadir..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={adding}
      />
      {searching && <p className="mt-1 text-xs text-muted-foreground">Buscando...</p>}
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-md">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => handleSelect(s.place_id)}
              disabled={adding}
            >
              {s.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertyRecommendationsSection({
  propertyId,
  initialRecommendations,
  categoriesDetected,
}: {
  propertyId: string;
  initialRecommendations: PropertyRecommendation[];
  categoriesDetected: PropertyRecommendationCategory[];
}) {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Categories the host revealed by hand this session (see "+ Añadir
  // sección" below) — not persisted; once a place is actually added the
  // category has a row and stays visible on its own from then on.
  const [manuallyRevealed, setManuallyRevealed] = useState<Set<PropertyRecommendationCategory>>(
    new Set()
  );

  useEffect(() => setRecommendations(initialRecommendations), [initialRecommendations]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const response = await fetch(`/api/property-recommendations/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!response.ok) {
      toast.error("No se pudo eliminar el lugar");
      return;
    }
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    setConfirmDeleteId(null);
  }

  // "Qué visitar"/"Dónde comer"/"Ocio nocturno" always show — every
  // property has relevant content for them. "Playas"/"Naturaleza" only
  // show once detected near the property, once the host has actually added
  // a place there, or once revealed by hand for this session.
  const visibleCategories = ALL_CATEGORIES.filter((category) => {
    if (BASE_RECOMMENDATION_CATEGORIES.includes(category)) return true;
    return (
      categoriesDetected.includes(category) ||
      recommendations.some((r) => r.category === category) ||
      manuallyRevealed.has(category)
    );
  });
  const hiddenOptionalCategories = OPTIONAL_RECOMMENDATION_CATEGORIES.filter(
    (category) => !visibleCategories.includes(category)
  );

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">Recomendaciones locales</h2>
      {visibleCategories.map((category) => {
        const items = recommendations.filter((r) => r.category === category);
        const Icon = RECOMMENDATION_CATEGORY_ICONS[category];
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="size-4" strokeWidth={1.5} />
                {RECOMMENDATION_CATEGORY_LABELS[category]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin lugares todavía.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{rec.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[
                            formatDistance(rec),
                            rec.rating != null ? `★ ${rec.rating}` : null,
                            rec.source === "manual" ? "Manual" : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {rec.maps_url && (
                          <a
                            href={rec.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink size={14} strokeWidth={1.5} />
                          </a>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(rec.id)}
                          disabled={deletingId === rec.id}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <AddPlaceSearch
                propertyId={propertyId}
                category={category}
                onAdded={(rec) => setRecommendations((prev) => [...prev, rec])}
              />
            </CardContent>
          </Card>
        );
      })}

      {hiddenOptionalCategories.length > 0 && (
        <div className="flex flex-wrap gap-3 px-1">
          {hiddenOptionalCategories.map((category) => (
            <button
              key={category}
              type="button"
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              onClick={() =>
                setManuallyRevealed((prev) => new Set(prev).add(category))
              }
            >
              + Añadir sección de {RECOMMENDATION_CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="¿Eliminar este lugar?"
        description="Esta acción no se puede deshacer."
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        loading={deletingId !== null}
      />
    </div>
  );
}
