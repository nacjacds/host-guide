"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TilePanel } from "./TilePanel";
import type { GuideBlock } from "@/types";

export function TileGrid({ blocks }: { blocks: GuideBlock[] }) {
  const [activeBlock, setActiveBlock] = useState<GuideBlock | null>(null);
  const visibleBlocks = blocks
    .filter((b) => b.is_visible)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
        {visibleBlocks.map((block) => (
          <Card
            key={block.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setActiveBlock(block)}
          >
            <CardHeader className="items-center text-center">
              <span className="text-3xl">{block.icon ?? "📄"}</span>
              <CardTitle className="text-sm">{block.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={!!activeBlock} onOpenChange={(open) => !open && setActiveBlock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeBlock?.title}</DialogTitle>
          </DialogHeader>
          {activeBlock && <TilePanel block={activeBlock} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
