export type PlanId = "free" | "starter" | "pro" | "agency";

export interface PlanDefinition {
  id: PlanId;
  label: string;
  priceEurMonth: number;
  maxProperties: number;
  aiEnabled: boolean;
  analyticsEnabled: boolean;
  whiteLabel: boolean;
  features: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    label: "Free",
    priceEurMonth: 0,
    maxProperties: 1,
    aiEnabled: false,
    analyticsEnabled: false,
    whiteLabel: false,
    features: ["1 propiedad", "Bloques de contenido manuales", "QR descargable"],
  },
  starter: {
    id: "starter",
    label: "Starter",
    priceEurMonth: 4,
    maxProperties: 3,
    aiEnabled: true,
    analyticsEnabled: false,
    whiteLabel: false,
    features: ["3 propiedades", "Generación de contenido con IA", "Recomendaciones IA", "QR descargable"],
  },
  pro: {
    id: "pro",
    label: "Pro",
    priceEurMonth: 12,
    maxProperties: 10,
    aiEnabled: true,
    analyticsEnabled: true,
    whiteLabel: false,
    features: ["10 propiedades", "Todo lo de Starter", "Estadísticas de visitas", "Bot de WhatsApp"],
  },
  agency: {
    id: "agency",
    label: "Agency",
    priceEurMonth: 29,
    maxProperties: 30,
    aiEnabled: true,
    analyticsEnabled: true,
    whiteLabel: true,
    features: ["30 propiedades", "Todo lo de Pro", "Marca blanca", "Soporte prioritario"],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "agency"];

export function getPlan(planId: string | null | undefined): PlanDefinition {
  return PLANS[(planId as PlanId) ?? "free"] ?? PLANS.free;
}

export function planPropertyLimit(planId: string | null | undefined): number {
  return getPlan(planId).maxProperties;
}
