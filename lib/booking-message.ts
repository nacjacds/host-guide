import type { GuestLanguage } from "@/types";

export function formatCheckinDate(dateStr: string, language: GuestLanguage): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(
    language === "en" ? "en-US" : "es-ES",
    { day: "numeric", month: "long", timeZone: "UTC" }
  );
}

export function buildBookingWelcomeMessage({
  guestName,
  checkinDate,
  checkinTime,
  propertyName,
  guideUrl,
  language,
}: {
  guestName: string;
  checkinDate: string;
  checkinTime: string | null;
  propertyName: string;
  guideUrl: string;
  language: GuestLanguage;
}): string {
  const dateLabel = formatCheckinDate(checkinDate, language);

  if (language === "en") {
    const timeClause = checkinTime ? ` from ${checkinTime}` : "";
    return `Hi ${guestName}! We'll be expecting you on ${dateLabel}${timeClause}. Here's all the information for your stay at ${propertyName}: ${guideUrl}. Any questions, just message me!`;
  }

  const timeClause = checkinTime ? ` a partir de las ${checkinTime}` : "";
  return `¡Hola ${guestName}! Te esperamos el ${dateLabel}${timeClause}. Aquí tienes toda la información para tu estancia en ${propertyName}: ${guideUrl}. ¡Cualquier duda escríbeme!`;
}
