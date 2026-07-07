"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BlockEditor } from "./BlockEditor";
import { BlockToolbar } from "./BlockToolbar";
import { RecommendationsBlock } from "./blocks/RecommendationsBlock";
import { AddRecommendationDialog } from "./AddRecommendationDialog";
import { PublishPanel } from "./PublishPanel";
import type { GuideBlock, Property, Recommendation } from "@/types";

async function saveBlock(block: GuideBlock) {
  const response = await fetch(`/api/guide-blocks/${block.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: block.title,
      content: block.content,
      images: block.images,
      is_visible: block.is_visible,
    }),
  });
  return response.ok;
}

export function PropertyEditor({
  property,
  initialBlocks,
  initialRecommendations,
}: {
  property: Property;
  initialBlocks: GuideBlock[];
  initialRecommendations: Recommendation[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savingAll, setSavingAll] = useState(false);
  const [newBlockIds, setNewBlockIds] = useState<Set<string>>(new Set());

  // Re-sync when the server component re-fetches (e.g. after AI generation
  // calls router.refresh()) — useState's initial value is only read on mount.
  useEffect(() => setBlocks(initialBlocks), [initialBlocks]);
  useEffect(() => setRecommendations(initialRecommendations), [initialRecommendations]);

  useEffect(() => {
    if (dirtyIds.size === 0) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirtyIds]);

  function handleBlockCreated(block: GuideBlock) {
    setBlocks((prev) => [...prev, block]);
    setNewBlockIds((prev) => new Set(prev).add(block.id));
  }

  function handleBlockDeleted(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleBlockChange(id: string, patch: Partial<GuideBlock>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    setDirtyIds((prev) => new Set(prev).add(id));
  }

  // For changes already persisted server-side (image upload/delete) —
  // updates local state without flagging the block as having unsaved edits.
  function handleBlockSynced(id: string, patch: Partial<GuideBlock>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  async function handleSaveOne(id: string) {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    setSavingIds((prev) => new Set(prev).add(id));
    const ok = await saveBlock(block);
    setSavingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (!ok) {
      toast.error("No se pudo guardar el bloque");
      return;
    }
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("Bloque guardado");
  }

  async function handleSaveAll() {
    const ids = Array.from(dirtyIds);
    if (ids.length === 0) return;

    setSavingAll(true);
    setSavingIds(new Set(ids));
    const results = await Promise.all(
      ids.map(async (id) => {
        const block = blocks.find((b) => b.id === id);
        if (!block) return true;
        return saveBlock(block);
      })
    );
    setSavingIds(new Set());
    setSavingAll(false);

    const failedCount = results.filter((ok) => !ok).length;
    const savedIds = ids.filter((_, i) => results[i]);
    setDirtyIds((prev) => {
      const next = new Set(prev);
      savedIds.forEach((id) => next.delete(id));
      return next;
    });

    if (failedCount > 0) {
      toast.error(`${failedCount} bloque(s) no se pudieron guardar`);
    } else {
      toast.success(`${ids.length} bloque(s) guardado(s)`);
    }
  }

  function handleRecommendationCreated(recommendation: Recommendation) {
    setRecommendations((prev) => [...prev, recommendation]);
  }

  function handleRecommendationChanged(id: string, patch: Partial<Recommendation> | null) {
    setRecommendations((prev) =>
      patch === null
        ? prev.filter((r) => r.id !== id)
        : prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-6 lg:grid-cols-3",
          dirtyIds.size > 0 && "pb-20 md:pb-0"
        )}
      >
        <div className="space-y-4 lg:col-span-2">
          <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between gap-3 bg-background/95 px-1 py-3 backdrop-blur-sm">
            <div className="min-w-0 flex-1">
              <BlockToolbar propertyId={property.id} onCreated={handleBlockCreated} />
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSaveAll}
              disabled={dirtyIds.size === 0 || savingAll}
              className="hidden shrink-0 md:inline-flex"
            >
              {savingAll ? "Guardando..." : `Guardar todo${dirtyIds.size ? ` (${dirtyIds.size})` : ""}`}
            </Button>
          </div>

          <div className="space-y-3">
            {blocks.map((block) => (
              <BlockEditor
                key={block.id}
                block={block}
                dirty={dirtyIds.has(block.id)}
                saving={savingIds.has(block.id)}
                defaultOpen={newBlockIds.has(block.id)}
                onChange={(patch) => handleBlockChange(block.id, patch)}
                onSynced={(patch) => handleBlockSynced(block.id, patch)}
                onSave={() => handleSaveOne(block.id)}
                onDeleted={handleBlockDeleted}
              />
            ))}
            {blocks.length === 0 && (
              <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                Añade tu primer bloque con los botones de arriba.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <PublishPanel property={property} />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">Recomendaciones</h2>
              <AddRecommendationDialog
                propertyId={property.id}
                onCreated={handleRecommendationCreated}
              />
            </div>
            <RecommendationsBlock
              recommendations={recommendations}
              onChanged={handleRecommendationChanged}
            />
          </div>
        </div>
      </div>

      {dirtyIds.size > 0 && (
        <div className="fixed right-0 bottom-0 left-20 z-20 border-t border-l border-border bg-background/95 p-3 backdrop-blur-sm md:hidden">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSaveAll}
            disabled={savingAll}
            className="w-full"
          >
            {savingAll ? "Guardando..." : `Guardar todo (${dirtyIds.size})`}
          </Button>
        </div>
      )}
    </>
  );
}
