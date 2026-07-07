export function formatCheckinDateEs(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function buildBookingWelcomeMessage({
  guestName,
  checkinDate,
  checkinTime,
  propertyName,
  guideUrl,
}: {
  guestName: string;
  checkinDate: string;
  checkinTime: string | null;
  propertyName: string;
  guideUrl: string;
}): string {
  const dateLabel = formatCheckinDateEs(checkinDate);
  const timeClause = checkinTime ? ` a partir de las ${checkinTime}` : "";
  return `¡Hola ${guestName}! Te esperamos el ${dateLabel}${timeClause}. Aquí tienes toda la información para tu estancia en ${propertyName}: ${guideUrl}. ¡Cualquier duda escríbeme!`;
}
