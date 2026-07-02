import Anthropic from "@anthropic-ai/sdk";
import type { HostTone } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-6";

function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON found in Claude response");
  return JSON.parse(match[0]) as T;
}

export interface GuideContent {
  welcome_message: string;
  checkin_tips: string[];
  checkout_tips: string[];
  rules: string[];
  neighborhood_description: string;
}

export async function generateGuideContent(property: {
  name: string;
  address: string;
  hostTone: HostTone;
}): Promise<GuideContent> {
  const prompt = `
Eres un asistente que ayuda a propietarios de alojamientos turísticos a crear guías para sus huéspedes.

Genera el contenido para la guía del siguiente alojamiento:
- Nombre: ${property.name}
- Dirección: ${property.address}
- Tono del anfitrión: ${property.hostTone === "friendly" ? "cercano, tuteo" : "formal, usted"}

Devuelve SOLO un JSON con esta estructura exacta:
{
  "welcome_message": "Mensaje de bienvenida personalizado (2-3 frases)",
  "checkin_tips": ["tip1", "tip2", "tip3"],
  "checkout_tips": ["tip1", "tip2", "tip3"],
  "rules": ["norma1", "norma2", "norma3", "norma4", "norma5"],
  "neighborhood_description": "Descripción del barrio/zona en 2 frases"
}
`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return extractJson<GuideContent>(text);
}

export interface RecommendationDraft {
  place_id: string;
  description: string;
}

export async function generateRecommendationDescriptions(params: {
  propertyName: string;
  address: string;
  guestProfile: string;
  category: string;
  places: unknown[];
}): Promise<RecommendationDraft[]> {
  const prompt = `
Eres el asistente de ${params.propertyName}, un alojamiento en ${params.address}.

Los huéspedes típicos son: ${params.guestProfile}

Estos son los ${params.category} más valorados cerca del alojamiento (datos de Google):
${JSON.stringify(params.places, null, 2)}

Selecciona los 3 mejores y escribe una descripción breve (máximo 2 frases) para cada uno.
La descripción debe ser útil y personal, no un resumen genérico.
Menciona algo específico: qué pedir, cuándo ir, qué hace especial al lugar.

Devuelve SOLO un JSON array:
[
  {
    "place_id": "...",
    "description": "..."
  }
]
`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return extractJson<RecommendationDraft[]>(text);
}

export async function askBot(systemPrompt: string, userMessage: string) {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}
