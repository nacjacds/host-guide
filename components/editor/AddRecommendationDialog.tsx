"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Recommendation, RecommendationCategory } from "@/types";

const CATEGORY_LABELS: Record<RecommendationCategory, string> = {
  restaurant: "Restaurante",
  bar: "Bar",
  supermarket: "Supermercado",
  pharmacy: "Farmacia",
  transport: "Transporte",
  activity: "Actividad",
};

export function AddRecommendationDialog({
  propertyId,
  onCreated,
}: {
  propertyId: string;
  onCreated: (recommendation: Recommendation) => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<RecommendationCategory>("restaurant");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setCategory("restaurant");
    setName("");
    setAddress("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/properties/${propertyId}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, name, address, description }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo crear la recomendación");
        return;
      }

      const { recommendation } = await response.json();
      onCreated(recommendation);
      toast.success("Recomendación añadida");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Recomendación
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva recomendación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rec-category">Categoría</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as RecommendationCategory)}
            >
              <SelectTrigger id="rec-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as RecommendationCategory[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rec-name">Nombre</Label>
            <Input
              id="rec-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="rec-address">Dirección</Label>
            <Input
              id="rec-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="rec-description">Descripción</Label>
            <Textarea
              id="rec-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Añadiendo..." : "Añadir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
