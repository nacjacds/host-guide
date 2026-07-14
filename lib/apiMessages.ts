import type { AppLocale } from "@/lib/locale";

// Shared API error strings — reused verbatim across many route handlers
// (see the Fase-5 API-i18n inventory). Keep this file to genuinely
// repeated messages only; one-off, route-specific strings are translated
// inline at their call site with pick() instead of being forced in here.
export const commonApiMessages = {
  notAuthenticated: { es: "No autenticado", en: "Not authenticated" },
  notAuthorized: { es: "No autorizado", en: "Not authorized" },
  invalidData: { es: "Datos inválidos", en: "Invalid data" },
  invalidRequest: { es: "Petición inválida", en: "Invalid request" },
  invalidPlan: { es: "Plan inválido", en: "Invalid plan" },
  noFileReceived: { es: "No se recibió ningún archivo", en: "No file received" },
  notValidImage: {
    es: "El archivo no es una imagen válida",
    en: "The file is not a valid image",
  },
} satisfies Record<string, Record<AppLocale, string>>;

export function apiMessage(key: keyof typeof commonApiMessages, locale: AppLocale): string {
  return commonApiMessages[key][locale];
}

// Terse inline helper for one-off, non-shared strings — keeps the
// translation next to its single call site instead of growing an
// unwieldy flat catalog of route-specific keys.
export function pick(locale: AppLocale, es: string, en: string): string {
  return locale === "en" ? en : es;
}

// Image-type acceptance varies by route (cover images only accept JPG,
// most other uploads accept JPG/PNG/WebP) — parameterized rather than
// forked into two near-duplicate shared keys. Takes both locale variants
// of the type list so the conjunction ("o" vs "or") stays correct.
export function acceptedImageTypesMessage(
  typesLabel: { es: string; en: string },
  locale: AppLocale
): string {
  return pick(
    locale,
    `Solo se aceptan imágenes ${typesLabel.es}`,
    `Only ${typesLabel.en} images are accepted`
  );
}

export const JPG_PNG_WEBP_LABEL = { es: "JPG, PNG o WebP", en: "JPG, PNG, or WebP" };
export const JPG_ONLY_LABEL = { es: "JPG", en: "JPG" };

// Max upload size varies by route (1MB/2MB/3MB) — same reasoning.
export function imageTooLargeMessage(maxMB: number, locale: AppLocale): string {
  return pick(
    locale,
    `La imagen no puede superar ${maxMB}MB`,
    `The image can't be larger than ${maxMB}MB`
  );
}

// "X not found" (404) — the recurring shape across ~24 occurrences, but
// Spanish needs gender agreement on "no encontrado/a" per entity, so this
// can't be a single flat template the way the English side can.
export type NotFoundEntity = "property" | "block" | "place" | "recommendation" | "guide" | "user";

const ENTITY_LABELS: Record<NotFoundEntity, { es: string; en: string; gender: "m" | "f" }> = {
  property: { es: "Propiedad", en: "Property", gender: "f" },
  block: { es: "Bloque", en: "Block", gender: "m" },
  place: { es: "Lugar", en: "Place", gender: "m" },
  recommendation: { es: "Recomendación", en: "Recommendation", gender: "f" },
  guide: { es: "Guía", en: "Guide", gender: "f" },
  user: { es: "Usuario", en: "User", gender: "m" },
};

export function notFoundMessage(entity: NotFoundEntity, locale: AppLocale): string {
  const label = ENTITY_LABELS[entity];
  if (locale === "en") return `${label.en} not found`;
  return `${label.es} no encontrad${label.gender === "f" ? "a" : "o"}`;
}
