"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { compressImageFile } from "@/lib/compressImage";
import type { BlockImage } from "@/types";

const MAX_IMAGES = 3;
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PlaceImageUploader({
  blockId,
  placeId,
  images,
  onUploaded,
  onCaptionChange,
}: {
  blockId: string;
  placeId: string;
  images: BlockImage[];
  onUploaded: (images: BlockImage[]) => void;
  onCaptionChange: (images: BlockImage[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [pendingDeleteUrl, setPendingDeleteUrl] = useState<string | null>(null);
  const t = useTranslations("dashboard.editor.blocks.imageUploader");
  const tCommon = useTranslations("dashboard.common");

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t("onlyJpgPngWebp"));
      return;
    }

    setCompressing(true);
    const compressed = await compressImageFile(file, { maxSizeMB: 2, maxWidthOrHeight: 1920 });
    setCompressing(false);

    if (compressed.size > MAX_SIZE_BYTES) {
      toast.error(tCommon("imageStillTooLargeAfterCompression"));
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("placeId", placeId);
      const response = await fetch(`/api/guide-blocks/${blockId}/images/place`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("uploadError"));
        return;
      }

      const { image } = await response.json();
      onUploaded([...images, image]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon("networkError"));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(url: string) {
    setDeletingUrl(url);
    try {
      const response = await fetch(
        `/api/guide-blocks/${blockId}/images/place?url=${encodeURIComponent(url)}&placeId=${encodeURIComponent(placeId)}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        toast.error(t("deleteError"));
        return;
      }
      onUploaded(images.filter((img) => img.url !== url));
    } finally {
      setDeletingUrl(null);
      setPendingDeleteUrl(null);
    }
  }

  function handleCaption(url: string, caption: string) {
    onCaptionChange(images.map((img) => (img.url === url ? { ...img, caption } : img)));
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {t("placeImages", { count: images.length, max: MAX_IMAGES })}
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
                  onClick={() => setPendingDeleteUrl(img.url)}
                  disabled={deletingUrl === img.url}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
              <Input
                placeholder={t("captionPlaceholder")}
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
            disabled={uploading || compressing}
            onClick={() => fileInputRef.current?.click()}
          >
            {compressing ? tCommon("compressingImage") : uploading ? tCommon("saving") : t("addImages")}
          </Button>
        </>
      )}

      <ConfirmDialog
        open={pendingDeleteUrl !== null}
        onOpenChange={(open) => !open && setPendingDeleteUrl(null)}
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteDescription")}
        onConfirm={() => pendingDeleteUrl && handleDelete(pendingDeleteUrl)}
        loading={deletingUrl !== null}
      />
    </div>
  );
}
