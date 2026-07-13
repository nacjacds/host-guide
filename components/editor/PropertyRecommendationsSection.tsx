"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, ExternalLink, Sparkles, Pencil, Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  BASE_RECOMMENDATION_CATEGORIES,
  OPTIONAL_RECOMMENDATION_CATEGORIES,
  RECOMMENDATION_CATEGORY_LABELS,
  RECOMMENDATION_CATEGORY_ICONS,
  type RecommendationQuota,
} from "@/lib/recommendations/constants";
import type { PropertyRecommendation, PropertyRecommendationCategory } from "@/types";

const ALL_CATEGORIES = [...BASE_RECOMMENDATION_CATEGORIES, ...OPTIONAL_RECOMMENDATION_CATEGORIES];

function formatDistance(rec: PropertyRecommendation): string | null {
  if (rec.distance_meters == null) return null;
  const meters =
    rec.distance_meters < 1000
      ? `${rec.distance_meters}m`
      : `${(rec.distance_meters / 1000).toFixed(1)}km`;
  return rec.distance_walking_minutes != null
    ? `${meters} · ${rec.distance_walking_minutes} min andando`
    : meters;
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
  initialQuota,
  upgradePlanLabel,
}: {
  propertyId: string;
  initialRecommendations: PropertyRecommendation[];
  categoriesDetected: PropertyRecommendationCategory[];
  initialQuota: RecommendationQuota;
  upgradePlanLabel: string | null;
}) {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEnOverrideEnabled, setEditEnOverrideEnabled] = useState(false);
  const [editDescriptionEn, setEditDescriptionEn] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [quota, setQuota] = useState(initialQuota);
  const [generatingCategory, setGeneratingCategory] = useState<PropertyRecommendationCategory | null>(
    null
  );
  // Categories the host revealed by hand this session (see "+ Añadir
  // sección" below) — not persisted; once a place is actually added the
  // category has a row and stays visible on its own from then on.
  const [manuallyRevealed, setManuallyRevealed] = useState<Set<PropertyRecommendationCategory>>(
    new Set()
  );
  // Collapse state per category, remembered across sessions. Categories
  // start expanded — the host needs to review AI-generated content before
  // it's shown to guests, so hiding it by default would bury mistakes.
  // Collapsing is for tidying up afterwards, not a starting state.
  const [collapsedCategories, setCollapsedCategories] = useState<
    Set<PropertyRecommendationCategory>
  >(new Set());

  useEffect(() => setRecommendations(initialRecommendations), [initialRecommendations]);

  useEffect(() => {
    const stored = localStorage.getItem(`welcokit:reco-collapsed:${propertyId}`);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as PropertyRecommendationCategory[];
      setCollapsedCategories(new Set(parsed));
    } catch {
      // Ignore malformed/stale localStorage value.
    }
  }, [propertyId]);

  function toggleCategoryCollapsed(category: PropertyRecommendationCategory) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      localStorage.setItem(
        `welcokit:reco-collapsed:${propertyId}`,
        JSON.stringify(Array.from(next))
      );
      return next;
    });
  }

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

  function startEdit(rec: PropertyRecommendation) {
    setEditingId(rec.id);
    setEditName(rec.name);
    setEditDescription(rec.description ?? "");
    setEditEnOverrideEnabled(!!rec.description_en_override);
    setEditDescriptionEn(rec.description_en_override ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditEnOverrideEnabled(false);
    setEditDescriptionEn("");
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setSavingEdit(true);
    try {
      const response = await fetch(`/api/property-recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
          // Switch off, or on with empty text, both mean "no override" —
          // revert to automatic translation.
          description_en_override:
            editEnOverrideEnabled && editDescriptionEn.trim() ? editDescriptionEn.trim() : null,
        }),
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo guardar el cambio");
        return;
      }
      const { recommendation } = (await response.json()) as { recommendation: PropertyRecommendation };
      setRecommendations((prev) => prev.map((r) => (r.id === id ? recommendation : r)));
      cancelEdit();
      toast.success("Cambios guardados");
    } catch {
      toast.error("Error de red");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleGenerate(category: PropertyRecommendationCategory) {
    setGeneratingCategory(category);
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/property-recommendations/regenerate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
        }
      );

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudieron generar recomendaciones");
        return;
      }

      const { recommendations: newForCategory } = (await response.json()) as {
        recommendations: PropertyRecommendation[];
      };

      // Replace only this category's ai_curated rows — everything else
      // (manual entries here, and every other category) stays untouched.
      setRecommendations((prev) => [
        ...prev.filter((r) => !(r.category === category && r.source === "ai_curated")),
        ...newForCategory,
      ]);
      setQuota((prev) => ({
        ...prev,
        used: prev.used + 1,
        remaining: Math.max(0, prev.remaining - 1),
      }));

      if (newForCategory.length === 0) {
        toast.error("No se encontraron lugares reales cerca para esta categoría");
      } else {
        toast.success(`${newForCategory.length} lugares generados`);
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setGeneratingCategory(null);
    }
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
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Recomendaciones locales</h2>
        <span className="text-xs text-muted-foreground">
          {quota.remaining > 0 ? (
            `Te quedan ${quota.remaining} de ${quota.limit} regeneraciones este mes · Se reinician el ${quota.resetDateLabel}`
          ) : (
            <>
              Sin generaciones disponibles este mes · Se reinician el {quota.resetDateLabel}
              {upgradePlanLabel && (
                <>
                  {" · "}
                  <Link
                    href="/account"
                    className="text-primary underline underline-offset-2 hover:no-underline"
                  >
                    Mejorar plan
                  </Link>
                </>
              )}
            </>
          )}
        </span>
      </div>
      {visibleCategories.map((category) => {
        const items = recommendations.filter((r) => r.category === category);
        const Icon = RECOMMENDATION_CATEGORY_ICONS[category];
        const generating = generatingCategory === category;
        const collapsed = collapsedCategories.has(category);
        return (
          <Card key={category} className="overflow-visible">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <button
                  type="button"
                  onClick={() => toggleCategoryCollapsed(category)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      collapsed && "-rotate-90"
                    )}
                  />
                  <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{RECOMMENDATION_CATEGORY_LABELS[category]}</span>
                  {items.length > 0 && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({items.length})
                    </span>
                  )}
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate(category)}
                  disabled={generatingCategory !== null || quota.remaining <= 0}
                  title={
                    quota.remaining <= 0
                      ? `Sin generaciones disponibles este mes · Se reinician el ${quota.resetDateLabel}`
                      : undefined
                  }
                >
                  <Sparkles size={14} strokeWidth={1.5} />
                  {generating ? "Generando..." : "Generar con IA"}
                </Button>
              </CardTitle>
            </CardHeader>
            {collapsed ? null : (
            <CardContent className="space-y-3">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin lugares todavía.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((rec) =>
                    editingId === rec.id ? (
                      <div key={rec.id} className="space-y-2 rounded-lg border border-border p-2.5">
                        <div>
                          <Label htmlFor={`edit-name-${rec.id}`} className="text-xs">
                            Nombre
                          </Label>
                          <Input
                            id={`edit-name-${rec.id}`}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={savingEdit}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-description-${rec.id}`} className="text-xs">
                            Descripción
                          </Label>
                          <Textarea
                            id={`edit-description-${rec.id}`}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            disabled={savingEdit}
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-2">
                          <Label
                            htmlFor={`edit-en-toggle-${rec.id}`}
                            className="text-xs font-normal text-muted-foreground"
                          >
                            Escribir traducción en inglés a mano
                          </Label>
                          <Switch
                            id={`edit-en-toggle-${rec.id}`}
                            size="sm"
                            checked={editEnOverrideEnabled}
                            onCheckedChange={setEditEnOverrideEnabled}
                            disabled={savingEdit}
                          />
                        </div>
                        {editEnOverrideEnabled && (
                          <div>
                            <Label htmlFor={`edit-description-en-${rec.id}`} className="text-xs">
                              Descripción en inglés
                            </Label>
                            <Textarea
                              id={`edit-description-en-${rec.id}`}
                              value={editDescriptionEn}
                              onChange={(e) => setEditDescriptionEn(e.target.value)}
                              disabled={savingEdit}
                              rows={2}
                              placeholder="Se traduce automáticamente — escribe aquí para sobrescribir"
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={cancelEdit}
                            disabled={savingEdit}
                          >
                            <X size={14} strokeWidth={1.5} />
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSaveEdit(rec.id)}
                            disabled={savingEdit}
                          >
                            <Check size={14} strokeWidth={1.5} />
                            {savingEdit ? "Guardando..." : "Guardar"}
                          </Button>
                        </div>
                      </div>
                    ) : (
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
                              rec.source === "ai_curated_edited" ? "Editado" : null,
                              rec.description_en_override ? "EN manual" : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {rec.address && (
                            <p className="truncate text-xs text-muted-foreground">{rec.address}</p>
                          )}
                          {rec.description && (
                            <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
                          )}
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
                            onClick={() => startEdit(rec)}
                          >
                            <Pencil size={14} strokeWidth={1.5} />
                          </Button>
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
                    )
                  )}
                </div>
              )}
              <AddPlaceSearch
                propertyId={propertyId}
                category={category}
                onAdded={(rec) => setRecommendations((prev) => [...prev, rec])}
              />
            </CardContent>
            )}
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
