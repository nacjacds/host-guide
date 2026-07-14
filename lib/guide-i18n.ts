import type { GuideBlock } from "@/types";

export type GuideLocale = "es" | "en";

export const GUIDE_TRANSLATIONS = {
  es: {
    back: "Volver",
    recommendations: "Recomendaciones",
    recommendationsTile: "Recomendaciones",
    recommendationsEmpty: "Todavía no hay recomendaciones.",
    viewOnMap: "Ver en mapa",
    contactHost: "Contactar anfitrión",
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
  },
  en: {
    back: "Back",
    recommendations: "Recommendations",
    recommendationsTile: "Recommendations",
    recommendationsEmpty: "No recommendations yet.",
    viewOnMap: "View on map",
    contactHost: "Contact host",
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
  },
} as const;

export type GuideTranslationKey = keyof (typeof GUIDE_TRANSLATIONS)["es"];

export function getBlockTitle(
  block: Pick<GuideBlock, "type" | "title">,
  t: (key: GuideTranslationKey) => string
) {
  if (block.type === "custom") return block.title ?? "";
  return t(`block_${block.type}` as GuideTranslationKey);
}
