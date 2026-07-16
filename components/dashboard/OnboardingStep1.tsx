"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { compressImageFile } from "@/lib/compressImage";
import type { Property } from "@/types";

const MAX_COVER_SIZE_BYTES = 3 * 1024 * 1024;
const WELCOME_MESSAGE_MAX = 500;

export function OnboardingStep1({
  onCreated,
}: {
  onCreated: (property: Property) => void;
}) {
  const t = useTranslations("dashboard.onboarding.step1");
  const tCommon = useTranslations("dashboard.common");
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [compressingCover, setCompressingCover] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImportAirbnb() {
    if (!airbnbUrl) return;
    setImporting(true);
    try {
      const response = await fetch("/api/properties/import-airbnb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: airbnbUrl }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.error ?? t("importError"));
        return;
      }

      if (data.title) setName(data.title);
      if (data.address) setAddress(data.address);
      if (data.description) setWelcomeMessage(data.description.slice(0, WELCOME_MESSAGE_MAX));
      toast.success(t("imported"));
    } catch {
      toast.error(t("importNetworkError"));
    } finally {
      setImporting(false);
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "image/jpeg") {
      toast.error(t("onlyJpg"));
      return;
    }

    setCompressingCover(true);
    const compressed = await compressImageFile(file, { maxSizeMB: 3, maxWidthOrHeight: 1920 });
    setCompressingCover(false);

    if (compressed.size > MAX_COVER_SIZE_BYTES) {
      toast.error(tCommon("imageStillTooLargeAfterCompression"));
      return;
    }

    setCoverFile(compressed);
    setCoverPreview(URL.createObjectURL(compressed));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("createError"));
        setLoading(false);
        return;
      }

      const { property } = await response.json();

      if (airbnbUrl || welcomeMessage) {
        const patchResponse = await fetch(`/api/properties/${property.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            airbnb_url: airbnbUrl || null,
            welcome_message: welcomeMessage || null,
          }),
        });
        if (patchResponse.ok) {
          const { property: updated } = await patchResponse.json();
          Object.assign(property, updated);
        }
      }

      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        const coverResponse = await fetch(`/api/properties/${property.id}/cover-image`, {
          method: "POST",
          body: formData,
        });
        if (coverResponse.ok) {
          const { cover_image_url } = await coverResponse.json();
          property.cover_image_url = cover_image_url;
        }
      }

      onCreated(property);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon("networkError"));
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mx-auto max-w-sm space-y-4">
        <div className="rounded-lg border border-dashed border-border p-3">
          <Label htmlFor="onboarding-airbnb">{t("airbnbLabel")}</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="onboarding-airbnb"
              value={airbnbUrl}
              onChange={(e) => setAirbnbUrl(e.target.value)}
              placeholder="https://www.airbnb.com/rooms/..."
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleImportAirbnb}
              disabled={importing || !airbnbUrl}
            >
              {importing ? t("importing") : t("import")}
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("airbnbHint")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="onboarding-name">{t("nameLabel")}</Label>
            <Input
              id="onboarding-name"
              required
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="onboarding-address">{t("addressLabel")}</Label>
            <Input
              id="onboarding-address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("coverLabel")}</Label>
            {coverPreview ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt={t("coverAlt")}
                  className="h-32 w-full rounded-lg border border-border object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={compressingCover}
                >
                  {compressingCover ? tCommon("compressingImage") : t("change")}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={compressingCover}
              >
                {compressingCover ? tCommon("compressingImage") : t("uploadJpg")}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || compressingCover}>
            {loading ? t("creating") : t("continue")}
          </Button>
        </form>
      </div>
    </div>
  );
}
