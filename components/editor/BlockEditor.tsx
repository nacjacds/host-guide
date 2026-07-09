"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ChevronDown, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { WifiBlock, type WifiContent } from "./blocks/WifiBlock";
import { CheckinBlock, type CheckinContent } from "./blocks/CheckinBlock";
import { RulesBlock, type RulesContent } from "./blocks/RulesBlock";
import { CustomBlock, type CustomContent } from "./blocks/CustomBlock";
import { EmergencyBlock, type EmergencyContent } from "./blocks/EmergencyBlock";
import { PlaceListBlock, type PlaceListContent } from "./blocks/PlaceListBlock";
import { AIPlaceGenerateButton } from "./blocks/AIPlaceGenerateButton";
import { BlockImageUploader } from "./blocks/BlockImageUploader";
import type { BlockImage, GuideBlock } from "@/types";

const PLACE_LIST_TYPES = ["restaurants", "drinks", "nightlife", "attractions"] as const;

function summarizeBlock(block: GuideBlock): string {
  const content = block.content as Record<string, unknown>;
  switch (block.type) {
    case "wifi": {
      const c = content as unknown as WifiContent;
      return c.network_name ? `Red: ${c.network_name}` : "Sin configurar";
    }
    case "checkin":
    case "checkout": {
      const c = content as unknown as CheckinContent;
      return c.time ? `A las ${c.time}` : "Sin hora definida";
    }
    case "rules":
    case "parking":
    case "appliances":
    case "pool": {
      const c = content as unknown as RulesContent;
      const count = c.rules?.length ?? 0;
      return count === 0 ? "Sin elementos" : `${count} elemento${count === 1 ? "" : "s"}`;
    }
    case "custom": {
      const c = content as unknown as CustomContent;
      if (!c.text) return "Sin contenido";
      return c.text.length > 60 ? `${c.text.slice(0, 60)}…` : c.text;
    }
    case "emergencias": {
      const c = content as unknown as EmergencyContent;
      return c.general ? `Emergencias: ${c.general}` : "Sin configurar";
    }
    case "restaurants":
    case "drinks":
    case "nightlife":
    case "attractions": {
      const c = content as unknown as PlaceListContent;
      const count = c.places?.length ?? 0;
      return count === 0 ? "Sin lugares" : `${count} lugar${count === 1 ? "" : "es"}`;
    }
    default:
      return "";
  }
}

export function BlockEditor({
  block,
  dirty,
  saving,
  defaultOpen = false,
  onChange,
  onSynced,
  onSave,
  onDeleted,
}: {
  block: GuideBlock;
  dirty: boolean;
  saving: boolean;
  defaultOpen?: boolean;
  onChange: (patch: Partial<GuideBlock>) => void;
  onSynced: (patch: Partial<GuideBlock>) => void;
  onSave: () => void;
  onDeleted: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    transition: { duration: 200, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  });
  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function updateContent<T extends object>(content: T) {
    onChange({ content: content as unknown as Record<string, unknown> });
  }

  async function handleDelete() {
    setDeleting(true);
    const response = await fetch(`/api/guide-blocks/${block.id}`, { method: "DELETE" });
    if (!response.ok) {
      setDeleting(false);
      return;
    }
    setConfirmDeleteOpen(false);
    onDeleted(block.id);
  }

  return (
    <div ref={setNodeRef} style={sortableStyle} className={cn(isDragging && "relative z-10")}>
      <Card className={cn("group overflow-hidden py-0 gap-0", isDragging && "shadow-lg")}>
        <div className="flex items-center gap-1 pr-4">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Reordenar bloque"
            className={cn(
              "flex shrink-0 touch-none items-center justify-center rounded-lg p-2.5 text-muted-foreground opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <GripVertical className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left transition-colors hover:bg-accent/40"
          >
            <span className="text-xl leading-none">{block.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{block.title ?? block.type}</span>
                {dirty && (
                  <span
                    className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary"
                    title="Cambios sin guardar"
                  />
                )}
              </div>
              {!open && (
                <p className="truncate text-xs text-muted-foreground">{summarizeBlock(block)}</p>
              )}
            </div>
            <ChevronDown
              className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
            />
          </button>
        </div>

        {open && (
          <CardContent className="border-t border-border px-4 py-4">
            <div className="mb-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={block.is_visible}
                  onCheckedChange={(checked) => onChange({ is_visible: checked })}
                />
                Visible en la guía
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={deleting}
              >
                Eliminar
              </Button>
            </div>

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
            {(block.type === "rules" ||
              block.type === "parking" ||
              block.type === "appliances" ||
              block.type === "pool") && (
              <div className="space-y-3">
                <RulesBlock
                  content={block.content as unknown as RulesContent}
                  onChange={updateContent}
                />
                {block.type === "parking" && (
                  <AIPlaceGenerateButton
                    blockId={block.id}
                    onGenerated={(place) => {
                      const c = block.content as unknown as RulesContent;
                      const distance =
                        place.distance_meters != null ? `, a ${place.distance_meters}m` : "";
                      const line = `${place.name} — ${place.description} (${place.address}${distance}) ${place.maps_url}`;
                      updateContent({ rules: [...(c.rules ?? []), line] });
                    }}
                  />
                )}
              </div>
            )}
            {block.type === "custom" && (
              <CustomBlock
                title={block.title ?? ""}
                content={block.content as unknown as CustomContent}
                onTitleChange={(title) => onChange({ title })}
                onChange={updateContent}
              />
            )}
            {block.type === "emergencias" && (
              <EmergencyBlock
                content={block.content as unknown as EmergencyContent}
                onChange={updateContent}
              />
            )}
            {(PLACE_LIST_TYPES as readonly string[]).includes(block.type) && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={block.title ?? ""}
                    onChange={(e) => onChange({ title: e.target.value })}
                  />
                </div>
                <PlaceListBlock
                  blockId={block.id}
                  blockType={block.type}
                  content={block.content as unknown as PlaceListContent}
                  onChange={updateContent}
                />
              </div>
            )}

            <div className="mt-4">
              <BlockImageUploader
                blockId={block.id}
                images={block.images}
                onUploaded={(images: BlockImage[]) => onSynced({ images })}
                onCaptionChange={(images: BlockImage[]) => onChange({ images })}
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3">
              {dirty && <span className="text-xs text-muted-foreground">Cambios sin guardar</span>}
              <Button size="sm" onClick={onSave} disabled={!dirty || saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="¿Eliminar este bloque?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
