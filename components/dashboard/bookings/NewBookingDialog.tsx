"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Booking } from "@/types";

interface PropertyOption {
  id: string;
  name: string;
}

export function NewBookingDialog({
  properties,
  onCreated,
}: {
  properties: PropertyOption[];
  onCreated: (booking: Booking) => void;
}) {
  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkinDate, setCheckinDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  function reset() {
    setPropertyId(properties[0]?.id ?? "");
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setCheckinDate("");
    setCheckoutDate("");
    setAutoEmailEnabled(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyId) {
      toast.error("Selecciona una propiedad");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          checkin_date: checkinDate,
          checkout_date: checkoutDate,
          auto_email_enabled: autoEmailEnabled,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo crear la reserva");
        return;
      }

      const { booking } = await response.json();
      onCreated(booking);
      toast.success(
        booking.welcome_email_sent_at
          ? "Reserva creada y email de bienvenida enviado"
          : "Reserva creada"
      );
      reset();
      setOpen(false);
    } catch {
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" onClick={() => setOpen(true)}>
        Nueva reserva
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva reserva</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="booking-property">Propiedad</Label>
            <Select value={propertyId} onValueChange={(v) => v && setPropertyId(v)}>
              <SelectTrigger id="booking-property" className="w-full">
                <SelectValue>
                  {(value: string) => properties.find((p) => p.id === value)?.name ?? ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="guest-name">Nombre del huésped</Label>
            <Input
              id="guest-name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="guest-email">Email (opcional)</Label>
            <Input
              id="guest-email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="guest-phone">Teléfono (opcional)</Label>
            <Input
              id="guest-phone"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+34 600 000 000"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="checkin-date">Check-in</Label>
              <Input
                id="checkin-date"
                type="date"
                value={checkinDate}
                onChange={(e) => setCheckinDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkout-date">Check-out</Label>
              <Input
                id="checkout-date"
                type="date"
                value={checkoutDate}
                onChange={(e) => setCheckoutDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
            <Label htmlFor="auto-email-toggle" className="text-sm">
              Enviar email de bienvenida automáticamente
            </Label>
            <Switch
              id="auto-email-toggle"
              checked={autoEmailEnabled}
              onCheckedChange={setAutoEmailEnabled}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Creando..." : "Crear reserva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
