"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";

export interface AdminHostRow {
  id: string;
  email: string;
  plan: PlanId;
  propertyCount: number;
  createdAt: string;
}

function HostRow({ host }: { host: AdminHostRow }) {
  const [plan, setPlan] = useState<PlanId>(host.plan);
  const [saving, setSaving] = useState(false);

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
        toast.error(error ?? "No se pudo cambiar el plan");
        return;
      }
      toast.success(`Plan actualizado a ${PLANS[value as PlanId].label}`);
    } catch {
      setPlan(previous);
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2 pr-4 text-sm">{host.email}</td>
      <td className="py-2 pr-4">
        <Select value={plan} onValueChange={handlePlanChange} disabled={saving}>
          <SelectTrigger className="w-36" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLAN_ORDER.map((planId) => (
              <SelectItem key={planId} value={planId}>
                {PLANS[planId].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 pr-4 text-sm">{host.propertyCount}</td>
      <td className="py-2 text-sm text-muted-foreground">
        {new Date(host.createdAt).toLocaleDateString("es-ES")}
      </td>
    </tr>
  );
}

export function AdminHostsTable({ hosts }: { hosts: AdminHostRow[] }) {
  if (hosts.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay anfitriones.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Plan</th>
            <th className="py-2 pr-4 font-medium">Propiedades</th>
            <th className="py-2 font-medium">Registro</th>
          </tr>
        </thead>
        <tbody>
          {hosts.map((host) => (
            <HostRow key={host.id} host={host} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
