"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

const TYPE_LABELS: Record<SupportTicketType, string> = {
  bug: "Problema",
  feature_request: "Mejora",
  question: "Pregunta",
};

function TicketRow({
  ticket,
  onResolved,
}: {
  ticket: AdminTicketRow;
  onResolved: (id: string) => void;
}) {
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
        toast.error("No se pudo actualizar el ticket");
        return;
      }
      setStatus("closed");
      onResolved(ticket.id);
      toast.success("Ticket marcado como resuelto");
    } catch {
      toast.error("Error de red");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {TYPE_LABELS[ticket.type]}
          </span>
          <span
            className={
              status === "open"
                ? "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                : "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
            }
          >
            {status === "open" ? "Abierto" : "Resuelto"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(ticket.createdAt).toLocaleDateString("es-ES")}
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
          Ver captura
        </a>
      )}
      {status === "open" && (
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={handleResolve} disabled={updating}>
            {updating ? "..." : "Marcar como resuelto"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function AdminTicketsSection({ tickets }: { tickets: AdminTicketRow[] }) {
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
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="bug">Problema</SelectItem>
            <SelectItem value="feature_request">Mejora</SelectItem>
            <SelectItem value="question">Pregunta</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-40" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="open">Abiertos</SelectItem>
            <SelectItem value="closed">Resueltos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay tickets con estos filtros.</p>
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
