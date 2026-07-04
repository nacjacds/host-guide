"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Recommendation } from "@/types";

export function RecommendationsBlock({
  recommendations,
  onChanged,
}: {
  recommendations: Recommendation[];
  onChanged: (id: string, patch: Partial<Recommendation> | null) => void;
}) {
  async function handleToggleVisible(id: string, visible: boolean) {
    onChanged(id, { is_visible: visible });
    const response = await fetch(`/api/recommendations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_visible: visible }),
    });
    if (!response.ok) {
      toast.error("No se pudo actualizar la recomendación");
      onChanged(id, { is_visible: !visible });
    }
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/recommendations/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("No se pudo eliminar la recomendación");
      return;
    }
    onChanged(id, null);
  }

  if (!recommendations.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay recomendaciones añadidas.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <Card key={rec.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{rec.name}</CardTitle>
            <div className="flex items-center gap-3">
              <Switch
                checked={rec.is_visible}
                onCheckedChange={(checked) => handleToggleVisible(rec.id, checked)}
              />
              <Button variant="ghost" size="sm" onClick={() => handleDelete(rec.id)}>
                Eliminar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {rec.address && <p className="text-xs text-muted-foreground">{rec.address}</p>}
            <p className="text-sm text-muted-foreground">{rec.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
