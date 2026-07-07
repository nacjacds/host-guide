"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ShareGuideDialog } from "@/components/dashboard/ShareGuideDialog";
import { NewBookingDialog } from "./NewBookingDialog";
import type { Booking, BookingStatus, GuestLanguage } from "@/types";

export interface BookingRow {
  id: string;
  propertyId: string;
  propertyName: string;
  guideUrl: string;
  checkinTime: string | null;
  guestName: string;
  guestLanguage: GuestLanguage;
  checkinDate: string;
  checkoutDate: string;
  status: BookingStatus;
  welcomeEmailSentAt: string | null;
}

interface PropertyOption {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pendiente",
  active: "Activa",
  completed: "Completada",
};

const STATUS_VARIANTS: Record<BookingStatus, "outline" | "default" | "secondary"> = {
  pending: "outline",
  active: "default",
  completed: "secondary",
};

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function BookingsList({
  initialRows,
  propertiesById,
}: {
  initialRows: BookingRow[];
  propertiesById: Record<string, { name: string; guideUrl: string; checkinTime: string | null }>;
}) {
  const [rows, setRows] = useState(initialRows);

  function handleCreated(booking: Booking) {
    const property = propertiesById[booking.property_id];
    if (!property) return;
    setRows((prev) => [
      {
        id: booking.id,
        propertyId: booking.property_id,
        propertyName: property.name,
        guideUrl: property.guideUrl,
        checkinTime: property.checkinTime,
        guestName: booking.guest_name,
        guestLanguage: booking.guest_language,
        checkinDate: booking.checkin_date,
        checkoutDate: booking.checkout_date,
        status: booking.status,
        welcomeEmailSentAt: booking.welcome_email_sent_at,
      },
      ...prev,
    ]);
  }

  const propertyOptions: PropertyOption[] = Object.entries(propertiesById).map(([id, p]) => ({
    id,
    name: p.name,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reservas</h1>
        <NewBookingDialog properties={propertyOptions} onCreated={handleCreated} />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no tienes reservas. Crea la primera con el botón de arriba.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{row.guestName}</p>
                  <Badge variant={STATUS_VARIANTS[row.status]}>
                    {STATUS_LABELS[row.status]}
                  </Badge>
                  {row.welcomeEmailSentAt && (
                    <span className="text-xs text-muted-foreground">Email enviado</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{row.propertyName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(row.checkinDate)} → {formatDate(row.checkoutDate)}
                </p>
              </div>
              <ShareGuideDialog
                propertyId={row.propertyId}
                propertyName={row.propertyName}
                guideUrl={row.guideUrl}
                guest={{
                  name: row.guestName,
                  checkinDate: row.checkinDate,
                  checkinTime: row.checkinTime,
                  language: row.guestLanguage,
                }}
                triggerClassName="shrink-0"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
