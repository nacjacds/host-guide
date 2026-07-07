"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { BlockImage } from "@/types";

const MAX_IMAGES = 3;
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function BlockImageUploader({
  blockId,
  images,
  onUploaded,
  onCaptionChange,
}: {
  blockId: string;
  images: BlockImage[];
  onUploaded: (images: BlockImage[]) => void;
  onCaptionChange: (images: BlockImage[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Solo se aceptan imágenes JPG, PNG o WebP");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("La imagen no puede superar 2MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/guide-blocks/${blockId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo subir la imagen");
        return;
      }

      const { image } = await response.json();
      onUploaded([...images, image]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de red");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(url: string) {
    setDeletingUrl(url);
    try {
      const response = await fetch(
        `/api/guide-blocks/${blockId}/images?url=${encodeURIComponent(url)}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        toast.error("No se pudo eliminar la imagen");
        return;
      }
      onUploaded(images.filter((img) => img.url !== url));
    } finally {
      setDeletingUrl(null);
    }
  }

  function handleCaption(url: string, caption: string) {
    onCaptionChange(images.map((img) => (img.url === url ? { ...img, caption } : img)));
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted-foreground">
        Imágenes ({images.length}/{MAX_IMAGES})
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.url} className="space-y-1">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDelete(img.url)}
                  disabled={deletingUrl === img.url}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
              <Input
                placeholder="Leyenda (opcional)"
                maxLength={120}
                value={img.caption}
                onChange={(e) => handleCaption(img.url, e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Subiendo..." : "+ Añadir imagen"}
          </Button>
        </>
      )}
    </div>
  );
}
