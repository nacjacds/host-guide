"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TriangleAlertIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PLAN_ORDER, type PlanId } from "@/lib/plans";
import { isSuperAdmin } from "@/lib/admin";
import { useLocale } from "@/components/shared/LocaleProvider";
import { formatLocalizedDate } from "@/lib/formatDate";

export interface AdminHostRow {
  id: string;
  email: string;
  plan: PlanId;
  propertyCount: number;
  createdAt: string;
}

function HostRow({ host, isCurrentUser }: { host: AdminHostRow; isCurrentUser: boolean }) {
  const t = useTranslations("dashboard.admin.hostsTable");
  const tPlans = useTranslations("dashboard.plans");
  const tCommon = useTranslations("dashboard.common");
  const { locale } = useLocale();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanId>(host.plan);
  const [saving, setSaving] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const impersonatingRef = useRef(false);

  async function handlePlanChange(value: string | null) {
    if (!value || value === plan) return;
    const previous = plan;
    setPlan(value as PlanId);
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/profiles/${host.id}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: value }),
      });
      if (!response.ok) {
        setPlan(previous);
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("planChangeError"));
        return;
      }
      toast.success(t("planUpdated", { plan: tPlans(`${value}.label`) }));
    } catch {
      setPlan(previous);
      toast.error(tCommon("networkError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleImpersonate() {
    if (!window.confirm(t("impersonateConfirm", { email: host.email }))) {
      return;
    }
    if (impersonatingRef.current) return;
    impersonatingRef.current = true;

    setImpersonating(true);
    try {
      const response = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: host.id }),
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("impersonateError"));
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setImpersonating(false);
      impersonatingRef.current = false;
    }
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2 pr-4 text-sm">{host.email}</td>
      <td className="py-2 pr-4">
        <div className="flex items-center gap-1.5">
          <Select value={plan} onValueChange={handlePlanChange} disabled={saving}>
            <SelectTrigger className="w-36" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLAN_ORDER.map((planId) => (
                <SelectItem key={planId} value={planId}>
                  {tPlans(`${planId}.label`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Informational, not an error — same amber/TriangleAlert
              convention as the WhatsApp-number notice in PublishPanel.tsx.
              Native title attribute (no dedicated Tooltip component exists
              in this UI kit yet) so this stays a single small icon per row
              instead of repeating a full sentence next to every host. */}
          <span title={t("planChangeDbOnlyWarning")} className="inline-flex shrink-0">
            <TriangleAlertIcon
              className="size-3.5 text-amber-600"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
        </div>
      </td>
      <td className="py-2 pr-4 text-sm">{host.propertyCount}</td>
      <td className="py-2 pr-4 text-sm text-muted-foreground">
        {formatLocalizedDate(host.createdAt, locale)}
      </td>
      <td className="py-2 text-sm">
        {isCurrentUser ? (
          // Own row: go straight to the real dashboard with the current
          // session as-is — impersonation is for viewing as a DIFFERENT
          // host, and /api/admin/impersonate itself already refuses to
          // impersonate your own account, so this is a plain navigation,
          // no cookies or banner involved.
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            {t("goToMyDashboard")}
          </Button>
        ) : (
          !isSuperAdmin(host.email) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleImpersonate}
              disabled={impersonating}
            >
              {impersonating ? t("entering") : t("enterAsUser")}
            </Button>
          )
        )}
      </td>
    </tr>
  );
}

export function AdminHostsTable({
  hosts,
  currentUserId,
}: {
  hosts: AdminHostRow[];
  currentUserId: string;
}) {
  const t = useTranslations("dashboard.admin.hostsTable");

  if (hosts.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">{t("email")}</th>
            <th className="py-2 pr-4 font-medium">{t("plan")}</th>
            <th className="py-2 pr-4 font-medium">{t("properties")}</th>
            <th className="py-2 pr-4 font-medium">{t("registered")}</th>
            <th className="py-2 font-medium">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {hosts.map((host) => (
            <HostRow key={host.id} host={host} isCurrentUser={host.id === currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
