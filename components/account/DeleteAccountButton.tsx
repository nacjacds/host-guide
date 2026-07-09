"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function DeleteAccountButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo eliminar la cuenta");
        return;
      }
      await createClient().auth.signOut();
      window.location.href = "/";
    } catch {
      toast.error("Error de red");
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
          Eliminar tu cuenta borra permanentemente tu perfil, todas tus propiedades, guías,
          bloques de contenido y recomendaciones.
        </p>
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          Eliminar cuenta
        </Button>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Eliminar tu cuenta?"
        description="Esta acción no se puede deshacer. Se eliminarán permanentemente tu perfil, todas tus propiedades, guías y recomendaciones."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </Card>
  );
}
