"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WifiBlock, type WifiContent } from "./blocks/WifiBlock";
import { CheckinBlock, type CheckinContent } from "./blocks/CheckinBlock";
import { RulesBlock, type RulesContent } from "./blocks/RulesBlock";
import { CustomBlock, type CustomContent } from "./blocks/CustomBlock";
import type { GuideBlock } from "@/types";

const SAVE_DEBOUNCE_MS = 500;

export function BlockEditor({
  block: initialBlock,
  onDeleted,
}: {
  block: GuideBlock;
  onDeleted: (id: string) => void;
}) {
  const [block, setBlock] = useState(initialBlock);
  const [deleting, setDeleting] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function persist(patch: Partial<GuideBlock>) {
    fetch(`/api/guide-blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => toast.error("No se pudo guardar el bloque"));
  }

  function scheduleSave(patch: Partial<GuideBlock>) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => persist(patch), SAVE_DEBOUNCE_MS);
  }

  function updateContent<T extends object>(content: T) {
    const nextContent = content as unknown as Record<string, unknown>;
    setBlock((b) => ({ ...b, content: nextContent }));
    scheduleSave({ content: nextContent });
  }

  function updateTitle(title: string) {
    setBlock((b) => ({ ...b, title }));
    scheduleSave({ title });
  }

  function toggleVisible(checked: boolean) {
    setBlock((b) => ({ ...b, is_visible: checked }));
    persist({ is_visible: checked });
  }

  async function handleDelete() {
    setDeleting(true);
    const response = await fetch(`/api/guide-blocks/${block.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("No se pudo eliminar el bloque");
      setDeleting(false);
      return;
    }
    onDeleted(block.id);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{block.title ?? block.type}</CardTitle>
        <div className="flex items-center gap-3">
          <Switch checked={block.is_visible} onCheckedChange={toggleVisible} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            Eliminar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {block.type === "wifi" && (
          <WifiBlock
            content={block.content as unknown as WifiContent}
            onChange={updateContent}
          />
        )}
        {(block.type === "checkin" || block.type === "checkout") && (
          <CheckinBlock
            content={block.content as unknown as CheckinContent}
            onChange={updateContent}
          />
        )}
        {(block.type === "rules" || block.type === "parking" || block.type === "appliances") && (
          <RulesBlock
            content={block.content as unknown as RulesContent}
            onChange={updateContent}
          />
        )}
        {block.type === "custom" && (
          <CustomBlock
            title={block.title ?? ""}
            content={block.content as unknown as CustomContent}
            onTitleChange={updateTitle}
            onChange={updateContent}
          />
        )}
      </CardContent>
    </Card>
  );
}
