"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function ShareGuideDialog({
  propertyId,
  guideUrl,
  triggerLabel = "Compartir guía",
  triggerVariant = "outline",
  triggerSize = "sm",
  triggerClassName,
}: {
  propertyId: string;
  guideUrl: string;
  triggerLabel?: string;
  triggerVariant?: "outline" | "secondary" | "default" | "ghost";
  triggerSize?: "sm" | "default";
  triggerClassName?: string;
}) {
  const t = useTranslations("dashboard.shareGuide");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

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
    try {
      await navigator.clipboard.writeText(guideUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyError"));
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
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{t("directLink")}</p>
            <a
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm text-primary underline underline-offset-2"
            >
              {guideUrl}
            </a>
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
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1.5" />
                  {t("copyLink")}
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3">
            {loadingQr ? (
              <p className="py-8 text-xs text-muted-foreground">{t("generatingQr")}</p>
            ) : qrDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={t("qrAlt")}
                  className="size-40"
                />
                <a
                  href={qrDataUrl}
                  download="qr-guia.png"
                  className="flex items-center gap-1 text-xs text-primary underline underline-offset-2"
                >
                  <Download size={12} />
                  {t("downloadQr")}
                </a>
              </>
            ) : (
              <p className="py-8 text-xs text-muted-foreground">{t("qrError")}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
