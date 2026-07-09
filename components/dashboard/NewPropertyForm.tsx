"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function NewPropertyForm() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address }),
      });

      if (!response.ok) {
        // Race condition: the page-load check let the form through (e.g. a
        // second tab created a property in between), but the backend is the
        // source of truth and rejected it. Data the host typed stays in the
        // form either way — only the error presentation differs so this
        // specific case can't be missed/dismissed like a toast.
        if (response.status === 403) {
          setLimitReached(true);
          return;
        }
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo crear la propiedad");
        return;
      }

      const { property } = await response.json();
      toast.success("Propiedad creada");
      window.location.href = `/properties/${property.id}/edit`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Nueva propiedad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del alojamiento</Label>
              <Input
                id="name"
                required
                placeholder="Apartamento Triana"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando..." : "Crear propiedad"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={limitReached} onOpenChange={setLimitReached}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Límite de propiedades alcanzado</AlertDialogTitle>
            <AlertDialogDescription>
              Has alcanzado el límite de propiedades de tu plan. Mejora tu plan para crear
              esta propiedad — tus datos no se han perdido, siguen rellenos en el formulario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLimitReached(false)}
            >
              Seguir editando
            </Button>
            <Button nativeButton={false} render={<Link href="/account" />}>
              Mejorar plan
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
