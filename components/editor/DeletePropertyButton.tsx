"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

export function DeletePropertyButton({
  propertyId,
  propertyName,
}: {
  propertyId: string;
  propertyName: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo eliminar la propiedad");
        return;
      }
      toast.success("Propiedad eliminada");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Error de red");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Zona de peligro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Eliminar &quot;{propertyName}&quot; borra permanentemente su guía, bloques,
          reservas y estadísticas asociadas.
        </p>
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          Eliminar propiedad
        </Button>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`¿Eliminar "${propertyName}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la guía, los bloques de contenido, las reservas y las estadísticas de esta propiedad."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </Card>
  );
}
