import { Resend } from "resend";
import { SUPERADMIN_EMAIL } from "@/lib/admin";
import { formatCheckinDate } from "@/lib/booking-message";
import type { GuestLanguage, SupportTicketType } from "@/types";

const FROM = process.env.RESEND_FROM_EMAIL ?? "WelcoKit <onboarding@resend.dev>";

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
      <p style="margin-top: 24px; font-size: 12px; color: #a8a29e;">WelcoKit</p>
    `,
  });
}

const BOOKING_EMAIL_COPY: Record<
  GuestLanguage,
  {
    subject: (propertyName: string) => string;
    greeting: (guestName: string) => string;
    checkinLine: (checkinLabel: string, propertyName: string) => string;
    checkoutLine: (checkoutLabel: string) => string;
    cta: string;
    qrHint: string;
  }
> = {
  es: {
    subject: (propertyName) => `Tu guía digital para ${propertyName}`,
    greeting: (guestName) => `¡Hola ${guestName}!`,
    checkinLine: (checkinLabel, propertyName) =>
      `Te esperamos el <strong>${checkinLabel}</strong> en <strong>${propertyName}</strong>.`,
    checkoutLine: (checkoutLabel) => `Salida: ${checkoutLabel}`,
    cta: "Ver mi guía",
    qrHint: "También puedes escanear el código QR adjunto para acceder desde el móvil.",
  },
  en: {
    subject: (propertyName) => `Your digital guide for ${propertyName}`,
    greeting: (guestName) => `Hi ${guestName}!`,
    checkinLine: (checkinLabel, propertyName) =>
      `We'll be expecting you on <strong>${checkinLabel}</strong> at <strong>${propertyName}</strong>.`,
    checkoutLine: (checkoutLabel) => `Check-out: ${checkoutLabel}`,
    cta: "View my guide",
    qrHint: "You can also scan the attached QR code to access it from your phone.",
  },
};

export async function sendBookingWelcomeEmail(params: {
  guestEmail: string;
  guestName: string;
  propertyName: string;
  coverImageUrl: string | null;
  checkinDate: string;
  checkoutDate: string;
  checkinTime: string | null;
  guideUrl: string;
  qrCodeBuffer: Buffer;
  language: GuestLanguage;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const copy = BOOKING_EMAIL_COPY[params.language];
  const timeClause = params.checkinTime
    ? params.language === "en"
      ? ` from ${params.checkinTime}`
      : ` a partir de las ${params.checkinTime}`
    : "";
  const checkinLabel = `${formatCheckinDate(params.checkinDate, params.language)}${timeClause}`;
  const checkoutLabel = formatCheckinDate(params.checkoutDate, params.language);

  await resend.emails.send({
    from: FROM,
    to: [params.guestEmail],
    subject: copy.subject(params.propertyName),
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: sans-serif;">
        ${
          params.coverImageUrl
            ? `<img src="${params.coverImageUrl}" alt="${params.propertyName}" style="width: 100%; border-radius: 12px 12px 0 0; display: block;" />`
            : ""
        }
        <div style="padding: 24px; background: #fff8f1; border-radius: ${
          params.coverImageUrl ? "0 0 12px 12px" : "12px"
        };">
          <h1 style="font-size: 20px; color: #7c2d12; margin: 0 0 12px;">${copy.greeting(params.guestName)}</h1>
          <p style="font-size: 15px; color: #44403c; margin: 0 0 8px;">
            ${copy.checkinLine(checkinLabel, params.propertyName)}
          </p>
          <p style="font-size: 15px; color: #44403c; margin: 0 0 16px;">${copy.checkoutLine(checkoutLabel)}</p>
          <a
            href="${params.guideUrl}"
            style="display: inline-block; padding: 12px 24px; background: #c2410c; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600;"
          >
            ${copy.cta}
          </a>
          <p style="margin-top: 24px; font-size: 13px; color: #78716c;">
            ${copy.qrHint}
          </p>
          <p style="margin-top: 16px; font-size: 12px; color: #a8a29e;">WelcoKit</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: "qr-guia.png",
        content: params.qrCodeBuffer,
      },
    ],
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
      <p style="margin-top: 24px; font-size: 12px; color: #a8a29e;">WelcoKit</p>
    `,
  });
}
