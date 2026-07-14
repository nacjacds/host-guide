"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocale } from "@/components/shared/LocaleProvider";
import { formatLocalizedDate } from "@/lib/formatDate";
import type { SupportTicketStatus, SupportTicketType } from "@/types";

export interface AdminTicketRow {
  id: string;
  email: string;
  type: SupportTicketType;
  subject: string;
  description: string;
  screenshotUrl: string | null;
  status: SupportTicketStatus;
  createdAt: string;
}

function TicketRow({
  ticket,
  onResolved,
}: {
  ticket: AdminTicketRow;
  onResolved: (id: string) => void;
}) {
  const t = useTranslations("dashboard.admin.tickets");
  const tCommon = useTranslations("dashboard.common");
  const { locale } = useLocale();
  const [status, setStatus] = useState(ticket.status);
  const [updating, setUpdating] = useState(false);

  async function handleResolve() {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (!response.ok) {
        toast.error(t("updateError"));
        return;
      }
      setStatus("closed");
      onResolved(ticket.id);
      toast.success(t("resolved"));
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {t(`typeLabels.${ticket.type}`)}
          </span>
          <span
            className={
              status === "open"
                ? "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                : "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
            }
          >
            {status === "open" ? t("statusOpen") : t("statusResolved")}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatLocalizedDate(ticket.createdAt, locale)}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium">{ticket.subject}</p>
      <p className="text-xs text-muted-foreground">{ticket.email}</p>
      <p className="mt-1 text-sm">{ticket.description}</p>
      {ticket.screenshotUrl && (
        <a
          href={ticket.screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs text-primary underline underline-offset-2"
        >
          {t("viewScreenshot")}
        </a>
      )}
      {status === "open" && (
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={handleResolve} disabled={updating}>
            {updating ? "..." : t("markResolved")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function AdminTicketsSection({ tickets }: { tickets: AdminTicketRow[] }) {
  const t = useTranslations("dashboard.admin.tickets");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return tickets
      .map((t) => (resolvedIds.has(t.id) ? { ...t, status: "closed" as const } : t))
      .filter((t) => typeFilter === "all" || t.type === typeFilter)
      .filter((t) => statusFilter === "all" || t.status === statusFilter);
  }, [tickets, typeFilter, statusFilter, resolvedIds]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-40" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            <SelectItem value="bug">{t("typeLabels.bug")}</SelectItem>
            <SelectItem value="feature_request">{t("typeLabels.feature_request")}</SelectItem>
            <SelectItem value="question">{t("typeLabels.question")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-40" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="open">{t("openFilter")}</SelectItem>
            <SelectItem value="closed">{t("resolvedFilter")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              onResolved={(id) => setResolvedIds((prev) => new Set(prev).add(id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
