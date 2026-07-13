"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function DeletePropertyButton({
  propertyId,
  propertyName,
}: {
  propertyId: string;
  propertyName: string;
}) {
  const t = useTranslations("dashboard.editor.deleteProperty");
  const tCommon = useTranslations("dashboard.common");
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const nameMatches = confirmText.trim() === propertyName;

  async function handleDelete() {
    if (!nameMatches) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmName: confirmText.trim() }),
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("deleteError"));
        return;
      }
      toast.success(t("deleted"));
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">{t("dangerZoneTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("description", { name: propertyName })}
        </p>
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            setConfirmText("");
            setConfirmOpen(true);
          }}
        >
          {t("deleteProperty")}
        </Button>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmTitle", { name: propertyName })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDescription", { name: propertyName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label htmlFor="confirm-property-name" className="sr-only">
              {t("propertyNameLabel")}
            </Label>
            <Input
              id="confirm-property-name"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={propertyName}
              autoComplete="off"
              disabled={deleting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button type="button" variant="ghost" disabled={deleting} />}>
              {tCommon("cancel")}
            </AlertDialogClose>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={!nameMatches || deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? tCommon("deleting") : t("deleteProperty")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
