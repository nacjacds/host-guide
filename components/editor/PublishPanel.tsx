"use client";

import { useRef, useState } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { GuideActionButtons } from "./GuideActionButtons";
import { toast } from "sonner";
import { sanitizePhoneDigits, isValidPhoneNumber } from "@/lib/phone";
import type { Property } from "@/types";

const MAX_COVER_SIZE_BYTES = 3 * 1024 * 1024;

export function PublishPanel({ property }: { property: Property }) {
  const [isPublished, setIsPublished] = useState(property.is_published);
  const [updating, setUpdating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [coverUrl, setCoverUrl] = useState(property.cover_image_url);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [confirmCoverDelete, setConfirmCoverDelete] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [whatsappNumber, setWhatsappNumber] = useState(property.whatsapp_number ?? "");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "image/jpeg") {
      toast.error("Solo se aceptan imágenes JPG");
      return;
    }
    if (file.size > MAX_COVER_SIZE_BYTES) {
      toast.error("La imagen no puede superar 3MB");
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/properties/${property.id}/cover-image`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo subir la imagen");
        return;
      }
      const { cover_image_url } = await response.json();
      setCoverUrl(cover_image_url);
      toast.success("Imagen de portada actualizada");
    } catch {
      toast.error("Error de red");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleRemoveCover() {
    setUploadingCover(true);
    try {
      const response = await fetch(`/api/properties/${property.id}/cover-image`, {
        method: "DELETE",
      });
      if (!response.ok) {
        toast.error("No se pudo eliminar la imagen");
        return;
      }
      setCoverUrl(null);
      toast.success("Imagen de portada eliminada");
    } catch {
      toast.error("Error de red");
    } finally {
      setUploadingCover(false);
      setConfirmCoverDelete(false);
    }
  }

  async function handleSaveWhatsapp() {
    const sanitized = sanitizePhoneDigits(whatsappNumber);
    if (sanitized && !isValidPhoneNumber(sanitized)) {
      toast.error("Introduce un teléfono válido: código de país + número (8-15 dígitos)");
      return;
    }
    setSavingWhatsapp(true);
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp_number: sanitized || null }),
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo guardar el número de WhatsApp");
        return;
      }
      setWhatsappNumber(sanitized);
      toast.success("Número de WhatsApp guardado");
    } catch {
      toast.error("Error de red");
    } finally {
      setSavingWhatsapp(false);
    }
  }

  async function handleTogglePublished(checked: boolean) {
    setUpdating(true);
    setIsPublished(checked);
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: checked }),
      });
      if (!response.ok) {
        setIsPublished(!checked);
        toast.error("No se pudo actualizar el estado de publicación");
        return;
      }
      toast.success(checked ? "Guía publicada" : "Guía despublicada");
    } catch {
      setIsPublished(!checked);
      toast.error("Error de red");
    } finally {
      setUpdating(false);
    }
  }

  async function handleShowQr() {
    if (qrDataUrl) {
      setQrDataUrl(null);
      return;
    }
    setLoadingQr(true);
    try {
      const response = await fetch(`/api/properties/${property.id}/qr`);
      if (!response.ok) {
        toast.error("No se pudo generar el código QR");
        return;
      }
      const { dataUrl } = await response.json();
      setQrDataUrl(dataUrl);
    } catch {
      toast.error("Error de red");
    } finally {
      setLoadingQr(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Publicación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
          <Label htmlFor="publish-toggle" className="text-sm">
            {isPublished ? "Publicada" : "Borrador"}
          </Label>
          <Switch
            id="publish-toggle"
            checked={isPublished}
            disabled={updating}
            onCheckedChange={handleTogglePublished}
          />
        </div>

        {/* Mobile renders this same pair portaled above the property tabs
            instead — see PropertyEditor.tsx. Hidden here below md to avoid
            showing it twice. */}
        <GuideActionButtons
          propertyId={property.id}
          slug={property.slug}
          isPublished={isPublished}
          className="hidden md:flex"
        />
        {!isPublished && (
          <p className="text-xs text-muted-foreground">
            Publica la guía para poder verla y compartirla con tus huéspedes.
          </p>
        )}

        <div className="space-y-2">
          <Label>Imagen de portada</Label>
          {coverUrl ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt="Portada de la guía"
                className="h-28 w-full rounded-lg border border-border object-cover"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                >
                  {uploadingCover ? "Subiendo..." : "Cambiar"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmCoverDelete(true)}
                  disabled={uploadingCover}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
            >
              {uploadingCover ? "Subiendo..." : "Subir imagen JPG"}
            </Button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg"
            className="hidden"
            onChange={handleCoverFileChange}
          />
          <p className="text-xs text-muted-foreground">Formato JPG, máximo 3MB.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">Teléfono de contacto para huéspedes</Label>
          <div className="flex gap-2">
            <Input
              id="whatsapp_number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="34600000000"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveWhatsapp}
              disabled={savingWhatsapp}
            >
              {savingWhatsapp ? "..." : "Guardar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Código de país + número, sin espacios ni +. Ej: 34612345678.
          </p>
          {!whatsappNumber && (
            <p className="flex items-start gap-1.5 text-xs text-amber-600">
              <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} />
              Sin este número (ni un teléfono personal en tu perfil), el botón de contacto
              no aparecerá en tu guía pública.
            </p>
          )}
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={handleShowQr}
          disabled={loadingQr}
        >
          {loadingQr ? "Generando..." : qrDataUrl ? "Ocultar QR" : "Ver código QR"}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          nativeButton={false}
          render={
            <a
              href={`/api/properties/${property.id}/qr-print`}
              download={`qr-imprimir-${property.slug}.pdf`}
            />
          }
        >
          Imprimir QR
        </Button>

        {qrDataUrl && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Código QR de la guía" className="size-40" />
            <a
              href={qrDataUrl}
              download={`qr-${property.slug}.png`}
              className="text-xs text-primary underline underline-offset-2"
            >
              Descargar PNG
            </a>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmCoverDelete}
        onOpenChange={setConfirmCoverDelete}
        title="¿Eliminar imagen de portada?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleRemoveCover}
        loading={uploadingCover}
      />
    </Card>
  );
}
