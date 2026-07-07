import { Resend } from "resend";
import { SUPERADMIN_EMAIL } from "@/lib/admin";
import type { SupportTicketType } from "@/types";

const FROM = process.env.RESEND_FROM_EMAIL ?? "Guía Digital Huéspedes <onboarding@resend.dev>";

const TICKET_TYPE_LABELS: Record<SupportTicketType, string> = {
  bug: "Reporte de problema",
  feature_request: "Sugerencia de mejora",
  question: "Pregunta",
};

export async function sendGuestMessageNotification(params: {
  hostEmail: string;
  propertyName: string;
  guestName: string | null;
  country: string | null;
  message: string;
  rating: number;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const stars = "★".repeat(params.rating) + "☆".repeat(5 - params.rating);
  const guestLabel = params.guestName ?? "Un huésped anónimo";
  const countryLabel = params.country ? ` (${params.country})` : "";

  await resend.emails.send({
    from: FROM,
    to: [params.hostEmail],
    subject: `Nuevo mensaje en el libro de visitas de ${params.propertyName}`,
    html: `
      <p><strong>${guestLabel}${countryLabel}</strong> ha dejado un mensaje en la guía de <strong>${params.propertyName}</strong>:</p>
      <p style="font-size: 18px; color: #d97706;">${stars}</p>
      <blockquote style="border-left: 3px solid #e5e5e5; margin: 0; padding-left: 12px; color: #333;">
        ${params.message}
      </blockquote>
    `,
  });
}

export async function sendSupportTicketNotification(params: {
  hostEmail: string;
  type: SupportTicketType;
  subject: string;
  description: string;
  screenshotUrl: string | null;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: FROM,
    to: [SUPERADMIN_EMAIL],
    subject: `[${TICKET_TYPE_LABELS[params.type]}] ${params.subject}`,
    html: `
      <p><strong>De:</strong> ${params.hostEmail}</p>
      <p><strong>Tipo:</strong> ${TICKET_TYPE_LABELS[params.type]}</p>
      <p><strong>Asunto:</strong> ${params.subject}</p>
      <blockquote style="border-left: 3px solid #e5e5e5; margin: 0; padding-left: 12px; color: #333;">
        ${params.description}
      </blockquote>
      ${
        params.screenshotUrl
          ? `<p><a href="${params.screenshotUrl}">Ver captura de pantalla</a></p>`
          : ""
      }
    `,
  });
}
