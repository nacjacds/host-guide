"use client";

import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
  tone = "destructive",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  tone?: "destructive" | "terracotta";
}) {
  // Only ever rendered inside (dashboard), which is wrapped in LocaleProvider
  // — safe to translate the default labels here so every caller gets a
  // correctly-localized Cancel/Delete/Deleting for free, even call sites
  // not yet migrated to next-intl themselves.
  const t = useTranslations("dashboard.common");
  const resolvedConfirmLabel = confirmLabel ?? t("delete");
  const resolvedCancelLabel = cancelLabel ?? t("cancel");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button type="button" variant="ghost" disabled={loading} />}>
            {resolvedCancelLabel}
          </AlertDialogClose>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              tone === "terracotta"
                ? "bg-[#FF4200] text-white hover:bg-[#FF4200]/90"
                : "bg-destructive text-white hover:bg-destructive/90"
            )}
          >
            {loading ? t("deleting") : resolvedConfirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
