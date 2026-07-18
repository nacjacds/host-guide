import type { GuideBlock } from "@/types";

export type GuideLocale = "es" | "en" | "fr" | "it" | "pt";

const GUIDE_TRANSLATIONS_AUTHORED = {
  es: {
    back: "Volver",
    recommendations: "Recomendaciones",
    recommendationsTile: "Recomendaciones",
    recommendationsEmpty: "Todavía no hay recomendaciones.",
    viewOnMap: "Ver en mapa",
    directions: "Cómo llegar",
    contactHost: "Contactar anfitrión",
    photoClose: "Cerrar",
    photoPrevious: "Foto anterior",
    photoNext: "Foto siguiente",
    photoViewLarger: "Ver foto ampliada",
    backToEditor: "Volver a editar",
    backToAdminPanel: "Volver a admin",
    hostIntroLabel: "Anfitrión",
    category_supermarket: "Supermercados",
    category_pharmacy: "Farmacias",
    category_transport: "Transporte",
    emergency_general: "Emergencias generales",
    emergency_police: "Policía",
    emergency_ambulance: "Ambulancia",
    emergency_firefighters: "Bomberos",
    emergency_hospital: "Hospital más cercano",
    block_wifi: "WiFi",
    block_checkin: "Check-in",
    block_checkout: "Check-out",
    block_rules: "Normas de la casa",
    block_parking: "Parking",
    block_appliances: "Electrodomésticos",
    block_emergencias: "Emergencias",
    block_pool: "Piscina",
    block_restaurants: "Dónde comer",
    block_drinks: "Copas y bares",
    block_nightlife: "Ocio nocturno",
    block_attractions: "Qué visitar",
    block_beaches: "Playas",
    block_nature: "Naturaleza",
    checkinFromLabel: "Check-in a partir de las",
    checkoutFromLabel: "Check-out antes de las",
    wifiConnectButton: "Ya estoy conectado",
    wifiConnectedPrefix: "Conectado a",
    wifiConnectedSuffix: "— ya puedes navegar la guía sin datos",
    wifiChangeNetwork: "Cambiar red",
    wifiScanToConnect: "Escanea para conectarte automáticamente",
    walkingMinutes: "min andando",
    emptyGuideTitle: "Esta guía está siendo preparada",
    emptyGuideMessage:
      "Esta guía está siendo preparada por tu anfitrión. Vuelve pronto o contacta directamente si necesitas algo.",
    guideUnavailableTitle: "Esta guía ya no está disponible",
    guideUnavailableMessage:
      "El anfitrión ha retirado esta guía. Si crees que es un error, contacta directamente con él.",
    linkExpiredTitle: "Este enlace ya no está disponible",
    linkExpiredMessage:
      "El periodo de estancia asociado a este enlace ya ha terminado. Si necesitas acceder a la guía, contacta con tu anfitrión.",
  },
  en: {
    back: "Back",
    recommendations: "Recommendations",
    recommendationsTile: "Recommendations",
    recommendationsEmpty: "No recommendations yet.",
    viewOnMap: "View on map",
    directions: "Directions",
    contactHost: "Contact host",
    photoClose: "Close",
    photoPrevious: "Previous photo",
    photoNext: "Next photo",
    photoViewLarger: "View larger photo",
    backToEditor: "Back to editor",
    backToAdminPanel: "Back to admin",
    hostIntroLabel: "Host",
    category_supermarket: "Supermarkets",
    category_pharmacy: "Pharmacies",
    category_transport: "Transport",
    emergency_general: "General emergency",
    emergency_police: "Police",
    emergency_ambulance: "Ambulance",
    emergency_firefighters: "Fire department",
    emergency_hospital: "Nearest hospital",
    block_wifi: "WiFi",
    block_checkin: "Check-in",
    block_checkout: "Check-out",
    block_rules: "House rules",
    block_parking: "Parking",
    block_appliances: "Appliances",
    block_emergencias: "Emergencies",
    block_pool: "Pool",
    block_restaurants: "Where to eat",
    block_drinks: "Drinks & bars",
    block_nightlife: "Nightlife",
    block_attractions: "What to see",
    block_beaches: "Beaches",
    block_nature: "Nature",
    checkinFromLabel: "Check-in from",
    checkoutFromLabel: "Check-out before",
    wifiConnectButton: "I'm connected",
    wifiConnectedPrefix: "Connected to",
    wifiConnectedSuffix: "— you can now browse the guide without using data",
    wifiChangeNetwork: "Change network",
    wifiScanToConnect: "Scan to connect automatically",
    walkingMinutes: "min walk",
    emptyGuideTitle: "This guide is being prepared",
    emptyGuideMessage:
      "Your host is still preparing this guide. Check back soon or reach out directly if you need anything.",
    guideUnavailableTitle: "This guide is no longer available",
    guideUnavailableMessage:
      "The host has taken this guide down. If you think this is a mistake, please reach out to them directly.",
    linkExpiredTitle: "This link is no longer available",
    linkExpiredMessage:
      "The stay period tied to this link has already ended. If you need to access the guide, please contact your host.",
  },
} as const;

export type GuideTranslationKey = keyof (typeof GUIDE_TRANSLATIONS_AUTHORED)["es"];
type GuideTranslationDict = Record<GuideTranslationKey, string>;

// French/Italian/Portuguese dictionaries don't exist yet (i18n expansion
// Fase 3) — until then, those locales fall back to the English UI chrome
// (buttons, labels) rather than crashing GuideLocaleProvider.t() with a
// missing key. This is separate from guest-facing CONTENT (guide_blocks,
// welcome_message, recommendations), which Claude already translates for
// real into all 5 locales via content_translations — only this static
// dictionary of ~50 short chrome strings is still pending translation.
export const GUIDE_TRANSLATIONS: Record<GuideLocale, GuideTranslationDict> = {
  ...GUIDE_TRANSLATIONS_AUTHORED,
  fr: GUIDE_TRANSLATIONS_AUTHORED.en,
  it: GUIDE_TRANSLATIONS_AUTHORED.en,
  pt: GUIDE_TRANSLATIONS_AUTHORED.en,
};

export function getBlockTitle(
  block: Pick<GuideBlock, "type" | "title">,
  t: (key: GuideTranslationKey) => string
) {
  if (block.type === "custom") return block.title ?? "";
  return t(`block_${block.type}` as GuideTranslationKey);
}
