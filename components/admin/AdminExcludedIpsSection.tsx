"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocale } from "@/components/shared/LocaleProvider";
import { formatLocalizedDate } from "@/lib/formatDate";
import type { AnalyticsExcludedIp } from "@/types";

export function AdminExcludedIpsSection({
  initialExcludedIps,
}: {
  initialExcludedIps: AnalyticsExcludedIp[];
}) {
  const t = useTranslations("dashboard.admin.excludedIps");
  const tCommon = useTranslations("dashboard.common");
  const { locale } = useLocale();
  const [excludedIps, setExcludedIps] = useState(initialExcludedIps);
  const [ipAddress, setIpAddress] = useState("");
  const [label, setLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const response = await fetch("/api/admin/excluded-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip_address: ipAddress.trim(), label: label.trim() || undefined }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.error ?? t("addError"));
        return;
      }

      setExcludedIps((prev) => [data.excludedIp, ...prev]);
      setIpAddress("");
      setLabel("");
      toast.success(t("added"));
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/excluded-ips/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error ?? t("deleteError"));
        return;
      }
      setExcludedIps((prev) => prev.filter((ip) => ip.id !== id));
      toast.success(t("deleted"));
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("description")}</p>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
        <div>
          <Label htmlFor="excluded-ip-address">{t("ipAddressLabel")}</Label>
          <Input
            id="excluded-ip-address"
            required
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="203.0.113.42"
            className="w-48"
          />
        </div>
        <div>
          <Label htmlFor="excluded-ip-label">{t("labelLabel")}</Label>
          <Input
            id="excluded-ip-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t("labelPlaceholder")}
            className="w-48"
          />
        </div>
        <Button type="submit" disabled={adding}>
          {adding ? tCommon("saving") : t("add")}
        </Button>
      </form>

      {excludedIps.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-2">
          {excludedIps.map((excludedIp) => (
            <div
              key={excludedIp.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
            >
              <div>
                <p className="font-mono text-sm">{excludedIp.ip_address}</p>
                <p className="text-xs text-muted-foreground">
                  {excludedIp.label ? `${excludedIp.label} — ` : ""}
                  {formatLocalizedDate(excludedIp.created_at, locale)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(excludedIp.id)}
                disabled={deletingId === excludedIp.id}
              >
                {deletingId === excludedIp.id ? "..." : t("remove")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
