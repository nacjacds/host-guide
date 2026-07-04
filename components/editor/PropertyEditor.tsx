"use client";

import { useEffect, useState } from "react";
import { BlockEditor } from "./BlockEditor";
import { BlockToolbar } from "./BlockToolbar";
import { RecommendationsBlock } from "./blocks/RecommendationsBlock";
import { AddRecommendationDialog } from "./AddRecommendationDialog";
import type { GuideBlock, Recommendation } from "@/types";

export function PropertyEditor({
  propertyId,
  initialBlocks,
  initialRecommendations,
}: {
  propertyId: string;
  initialBlocks: GuideBlock[];
  initialRecommendations: Recommendation[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [recommendations, setRecommendations] = useState(initialRecommendations);

  // Re-sync when the server component re-fetches (e.g. after AI generation
  // calls router.refresh()) — useState's initial value is only read on mount.
  useEffect(() => setBlocks(initialBlocks), [initialBlocks]);
  useEffect(() => setRecommendations(initialRecommendations), [initialRecommendations]);

  function handleBlockCreated(block: GuideBlock) {
    setBlocks((prev) => [...prev, block]);
  }

  function handleBlockDeleted(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
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
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Bloques de contenido</h2>
        <BlockToolbar propertyId={propertyId} onCreated={handleBlockCreated} />
        <div className="space-y-4">
          {blocks.map((block) => (
            <BlockEditor key={block.id} block={block} onDeleted={handleBlockDeleted} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recomendaciones</h2>
          <AddRecommendationDialog
            propertyId={propertyId}
            onCreated={handleRecommendationCreated}
          />
        </div>
        <RecommendationsBlock
          recommendations={recommendations}
          onChanged={handleRecommendationChanged}
        />
      </section>
    </div>
  );
}
