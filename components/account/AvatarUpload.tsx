"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

const MAX_SIZE_BYTES = 1 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({
  initialAvatarUrl,
  fullName,
}: {
  initialAvatarUrl: string | null;
  fullName: string;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Solo se aceptan imágenes JPG, PNG o WebP");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("La imagen no puede superar 1MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo subir la foto");
        return;
      }

      const { avatar_url } = await response.json();
      setAvatarUrl(avatar_url);
      toast.success("Foto de perfil actualizada");
    } catch {
      toast.error("Error de red");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      const response = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (!response.ok) {
        toast.error("No se pudo eliminar la foto");
        return;
      }
      setAvatarUrl(null);
      toast.success("Foto de perfil eliminada");
    } catch {
      toast.error("Error de red");
    } finally {
      setUploading(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
        <AvatarFallback className="text-base font-medium">
          {getInitials(fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Subiendo..." : "Cambiar"}
        </Button>
        {avatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={uploading}
          >
            Eliminar
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Eliminar foto de perfil?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleRemove}
        loading={uploading}
        tone="terracotta"
      />
    </div>
  );
}
