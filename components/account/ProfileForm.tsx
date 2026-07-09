"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "./AvatarUpload";
import { toast } from "sonner";
import type { Profile } from "@/types";

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [editing, setEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<{ fullName: string; phone: string } | null>(null);
  const [saving, setSaving] = useState(false);

  function handleEdit() {
    setSnapshot({ fullName, phone });
    setEditing(true);
  }

  function handleCancel() {
    if (snapshot) {
      setFullName(snapshot.fullName);
      setPhone(snapshot.phone);
    }
    setEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName || null,
          phone: phone || null,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo guardar el perfil");
        return;
      }

      toast.success("Perfil guardado");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AvatarUpload initialAvatarUrl={profile?.avatar_url ?? null} fullName={fullName} />

          <div>
            <Label htmlFor="full_name">Nombre completo</Label>
            {editing ? (
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            ) : (
              <p className="text-sm text-foreground">{fullName || "Sin especificar"}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>

          <div>
            <Label htmlFor="phone">Teléfono/WhatsApp personal</Label>
            {editing ? (
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
              />
            ) : (
              <p className="text-sm text-foreground">{phone || "Sin especificar"}</p>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="border-[#1B4F72] text-[#1B4F72] hover:bg-[#1B4F72]/5 hover:text-[#1B4F72]"
              onClick={handleEdit}
            >
              Editar perfil
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
