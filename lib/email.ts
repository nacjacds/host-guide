import { Resend } from "resend";
import { SUPERADMIN_EMAIL } from "@/lib/admin";
import type { SupportTicketType } from "@/types";

const FROM = process.env.RESEND_FROM_EMAIL ?? "WelcoKit <onboarding@resend.dev>";

const TICKET_TYPE_LABELS: Record<SupportTicketType, string> = {
  bug: "Reporte de problema",
  feature_request: "Sugerencia de mejora",
  question: "Pregunta",
};

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
      <p style="margin-top: 24px; font-size: 12px; color: #a8a29e;">WelcoKit</p>
    `,
  });
}
