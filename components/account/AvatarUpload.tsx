"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { compressImageFile } from "@/lib/compressImage";

const MAX_SIZE_BYTES = 1 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({
  initialAvatarUrl,
  fullName,
}: {
  initialAvatarUrl: string | null;
  fullName: string;
}) {
  const t = useTranslations("dashboard.account.avatar");
  const tCommon = useTranslations("dashboard.common");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t("invalidType"));
      return;
    }

    // Cropped to 200x200 server-side anyway, so 1024px is plenty of
    // headroom for that crop — no need for the full 1920px used elsewhere.
    setCompressing(true);
    const compressed = await compressImageFile(file, { maxSizeMB: 1, maxWidthOrHeight: 1024 });
    setCompressing(false);

    if (compressed.size > MAX_SIZE_BYTES) {
      toast.error(tCommon("imageStillTooLargeAfterCompression"));
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", compressed);
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("uploadError"));
        return;
      }

      const { avatar_url } = await response.json();
      setAvatarUrl(avatar_url);
      toast.success(t("updated"));
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      const response = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (!response.ok) {
        toast.error(t("removeError"));
        return;
      }
      setAvatarUrl(null);
      toast.success(t("removed"));
    } catch {
      toast.error(tCommon("networkError"));
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
          disabled={uploading || compressing}
        >
          {compressing ? tCommon("compressingImage") : uploading ? t("uploading") : t("change")}
        </Button>
        {avatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={uploading || compressing}
          >
            {t("remove")}
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
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteDescription")}
        onConfirm={handleRemove}
        loading={uploading}
        tone="terracotta"
      />
    </div>
  );
}
