"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { PLAN_ORDER, type PlanId } from "@/lib/plans";
import { isPurgeEligible, DELETED_PROPERTY_RETENTION_DAYS } from "@/lib/properties";
import { useLocale } from "@/components/shared/LocaleProvider";
import { formatLocalizedDate } from "@/lib/formatDate";

export interface AdminPropertyRow {
  id: string;
  name: string;
  slug: string;
  hostId: string;
  hostEmail: string;
  hostCurrentPlan: PlanId | null;
  isPublished: boolean;
  deletedAt: string | null;
  deletedByHostPlan: string | null;
  createdAt: string;
}

const PURGE_CONFIRM_PHRASE = "BORRAR PERMANENTEMENTE";

function PurgeDialog({
  property,
  open,
  onOpenChange,
  onPurged,
}: {
  property: AdminPropertyRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurged: () => void;
}) {
  const t = useTranslations("dashboard.admin.propertiesTable");
  const tCommon = useTranslations("dashboard.common");
  const [confirmText, setConfirmText] = useState("");
  const [purging, setPurging] = useState(false);
  const matches = confirmText.trim() === PURGE_CONFIRM_PHRASE;

  async function handlePurge() {
    if (!matches) return;
    setPurging(true);
    try {
      const response = await fetch(`/api/admin/properties/${property.id}/purge`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmPhrase: confirmText.trim() }),
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("purgeError"));
        return;
      }
      toast.success(t("purged", { name: property.name }));
      onOpenChange(false);
      onPurged();
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setPurging(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("purgeDialogTitle", { name: property.name })}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("purgeDialogDescription")} <strong>{PURGE_CONFIRM_PHRASE}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={PURGE_CONFIRM_PHRASE}
          autoComplete="off"
          disabled={purging}
        />
        <AlertDialogFooter>
          <AlertDialogClose render={<Button type="button" variant="ghost" disabled={purging} />}>
            {tCommon("cancel")}
          </AlertDialogClose>
          <Button
            type="button"
            onClick={handlePurge}
            disabled={!matches || purging}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {purging ? t("purging") : t("purgePermanently")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PropertyRow({
  property,
  hideHostColumn,
}: {
  property: AdminPropertyRow;
  hideHostColumn: boolean;
}) {
  const t = useTranslations("dashboard.admin.propertiesTable");
  const tPlans = useTranslations("dashboard.plans");
  const tCommon = useTranslations("dashboard.common");
  const { locale } = useLocale();
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);

  async function handleRestore() {
    if (!window.confirm(t("restoreConfirm", { name: property.name }))) {
      return;
    }
    setRestoring(true);
    try {
      const response = await fetch(`/api/admin/properties/${property.id}/restore`, {
        method: "POST",
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("restoreError"));
        return;
      }
      toast.success(t("restored", { name: property.name }));
      router.refresh();
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setRestoring(false);
    }
  }

  return (
    <tr className="border-b border-border last:border-0 align-top">
      <td className="py-2 pr-4">
        <p className="text-sm font-medium">{property.name}</p>
        <p className="text-xs text-muted-foreground">{property.slug}</p>
      </td>
      {!hideHostColumn && <td className="py-2 pr-4 text-sm">{property.hostEmail}</td>}
      <td className="py-2 pr-4 text-sm text-muted-foreground">
        {property.isPublished ? t("published") : t("draft")}
      </td>
      <td className="py-2 pr-4 text-sm">
        {property.deletedAt ? (
          <div className="space-y-0.5">
            <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {t("deletedByHostOn", { date: formatLocalizedDate(property.deletedAt, locale) })}
            </span>
            {property.deletedByHostPlan && (
              <p className="text-xs text-muted-foreground">
                {t("hostPlanAtDeletion", {
                  plan: PLAN_ORDER.includes(property.deletedByHostPlan as PlanId)
                    ? tPlans(`${property.deletedByHostPlan}.label`)
                    : property.deletedByHostPlan,
                })}
              </p>
            )}
            {isPurgeEligible(property.deletedAt) ? (
              <p className="text-xs text-muted-foreground">
                {t("eligibleForPurge", { days: DELETED_PROPERTY_RETENTION_DAYS })}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("purgeableFrom", {
                  date: formatLocalizedDate(
                    new Date(
                      new Date(property.deletedAt).getTime() +
                        DELETED_PROPERTY_RETENTION_DAYS * 24 * 60 * 60 * 1000
                    ),
                    locale
                  ),
                })}
              </p>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-2 text-sm">
        {property.deletedAt && (
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" onClick={handleRestore} disabled={restoring}>
              {restoring ? t("restoring") : t("restore")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setPurgeOpen(true)}
            >
              {t("purge")}
            </Button>
            <PurgeDialog
              property={property}
              open={purgeOpen}
              onOpenChange={setPurgeOpen}
              onPurged={() => router.refresh()}
            />
          </div>
        )}
      </td>
    </tr>
  );
}

export function AdminPropertiesTable({
  properties,
  hideHostColumn = false,
}: {
  properties: AdminPropertyRow[];
  // Set by the grouped-by-host view (AdminPropertiesGroupedByHost), which
  // already shows the host as the group header — repeating it in every row
  // would be redundant there.
  hideHostColumn?: boolean;
}) {
  const t = useTranslations("dashboard.admin.propertiesTable");

  if (properties.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">{t("property")}</th>
            {!hideHostColumn && <th className="py-2 pr-4 font-medium">{t("host")}</th>}
            <th className="py-2 pr-4 font-medium">{t("status")}</th>
            <th className="py-2 pr-4 font-medium">{t("deletedColumn")}</th>
            <th className="py-2 font-medium">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <PropertyRow key={property.id} property={property} hideHostColumn={hideHostColumn} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
