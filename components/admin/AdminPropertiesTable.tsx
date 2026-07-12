"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { PLANS, type PlanId } from "@/lib/plans";
import { isPurgeEligible, DELETED_PROPERTY_RETENTION_DAYS } from "@/lib/properties";

export interface AdminPropertyRow {
  id: string;
  name: string;
  slug: string;
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
        toast.error(error ?? "No se pudo purgar la propiedad");
        return;
      }
      toast.success(`"${property.name}" purgada permanentemente`);
      onOpenChange(false);
      onPurged();
    } catch {
      toast.error("Error de red");
    } finally {
      setPurging(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Purgar &quot;{property.name}&quot; definitivamente?</AlertDialogTitle>
          <AlertDialogDescription>
            Esto borra físicamente la propiedad y todos sus datos relacionados (recomendaciones,
            traducciones, guía, imagen de portada). No se puede deshacer. Para confirmar, escribe:{" "}
            <strong>{PURGE_CONFIRM_PHRASE}</strong>
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
            Cancelar
          </AlertDialogClose>
          <Button
            type="button"
            onClick={handlePurge}
            disabled={!matches || purging}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {purging ? "Purgando..." : "Purgar definitivamente"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PropertyRow({ property }: { property: AdminPropertyRow }) {
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);

  async function handleRestore() {
    if (!window.confirm(`¿Restaurar "${property.name}"? Volverá a estar visible para el host.`)) {
      return;
    }
    setRestoring(true);
    try {
      const response = await fetch(`/api/admin/properties/${property.id}/restore`, {
        method: "POST",
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo restaurar la propiedad");
        return;
      }
      toast.success(`"${property.name}" restaurada`);
      router.refresh();
    } catch {
      toast.error("Error de red");
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
      <td className="py-2 pr-4 text-sm">{property.hostEmail}</td>
      <td className="py-2 pr-4 text-sm text-muted-foreground">
        {property.isPublished ? "Publicada" : "Borrador"}
      </td>
      <td className="py-2 pr-4 text-sm">
        {property.deletedAt ? (
          <div className="space-y-0.5">
            <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              Borrada por el host el {new Date(property.deletedAt).toLocaleDateString("es-ES")}
            </span>
            {property.deletedByHostPlan && (
              <p className="text-xs text-muted-foreground">
                Plan del anfitrión al borrar: {PLANS[property.deletedByHostPlan as PlanId]?.label ?? property.deletedByHostPlan}
              </p>
            )}
            {isPurgeEligible(property.deletedAt) ? (
              <p className="text-xs text-muted-foreground">
                Elegible para purga (&gt;{DELETED_PROPERTY_RETENTION_DAYS} días)
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Purgable a partir del{" "}
                {new Date(
                  new Date(property.deletedAt).getTime() +
                    DELETED_PROPERTY_RETENTION_DAYS * 24 * 60 * 60 * 1000
                ).toLocaleDateString("es-ES")}
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
              {restoring ? "Restaurando..." : "Restaurar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setPurgeOpen(true)}
            >
              Purgar
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

export function AdminPropertiesTable({ properties }: { properties: AdminPropertyRow[] }) {
  if (properties.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay propiedades.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Propiedad</th>
            <th className="py-2 pr-4 font-medium">Anfitrión</th>
            <th className="py-2 pr-4 font-medium">Estado</th>
            <th className="py-2 pr-4 font-medium">Borrado</th>
            <th className="py-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <PropertyRow key={property.id} property={property} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
