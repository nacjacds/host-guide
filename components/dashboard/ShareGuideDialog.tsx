"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { buildBookingWelcomeMessage } from "@/lib/booking-message";

export interface ShareGuideGuest {
  name: string;
  checkinDate: string;
  checkinTime: string | null;
}

export function ShareGuideDialog({
  propertyId,
  propertyName,
  guideUrl,
  guest,
  triggerLabel = "Compartir guía",
  triggerVariant = "outline",
  triggerSize = "sm",
  triggerClassName,
}: {
  propertyId: string;
  propertyName: string;
  guideUrl: string;
  guest?: ShareGuideGuest | null;
  triggerLabel?: string;
  triggerVariant?: "outline" | "secondary" | "default" | "ghost";
  triggerSize?: "sm" | "default";
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const message = guest
    ? buildBookingWelcomeMessage({
        guestName: guest.name,
        checkinDate: guest.checkinDate,
        checkinTime: guest.checkinTime,
        propertyName,
        guideUrl,
      })
    : null;

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !qrDataUrl) {
      setLoadingQr(true);
      try {
        const response = await fetch(`/api/properties/${propertyId}/qr`);
        if (response.ok) {
          const { dataUrl } = await response.json();
          setQrDataUrl(dataUrl);
        }
      } catch {
        // Silently ignore — the link + copy message still work without a QR.
      } finally {
        setLoadingQr(false);
      }
    }
  }

  async function handleCopy() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el mensaje");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={triggerClassName}
        onClick={() => handleOpenChange(true)}
      >
        {triggerLabel}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartir guía</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {message && (
            <div className="space-y-2">
              <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                {message}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check size={14} className="mr-1.5" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1.5" />
                    Copiar mensaje
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Enlace directo</p>
            <a
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm text-primary underline underline-offset-2"
            >
              {guideUrl}
            </a>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3">
            {loadingQr ? (
              <p className="py-8 text-xs text-muted-foreground">Generando QR...</p>
            ) : qrDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Código QR de la guía"
                  className="size-40"
                />
                <a
                  href={qrDataUrl}
                  download="qr-guia.png"
                  className="flex items-center gap-1 text-xs text-primary underline underline-offset-2"
                >
                  <Download size={12} />
                  Descargar QR
                </a>
              </>
            ) : (
              <p className="py-8 text-xs text-muted-foreground">
                No se pudo generar el QR
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
