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

export interface RecommendationCandidate {
  place_id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  types: string[];
}

const CURATION_CATEGORY_GUIDANCE: Record<string, string> = {
  restaurants:
    "Prioriza comida auténtica local y buen ambiente por encima de cadenas turísticas o sitios genéricos para turistas. Usa el rating y el tipo de establecimiento como señal, no solo la popularidad.",
  nightlife:
    "Prioriza bares y locales con ambiente auténtico local por encima de cadenas turísticas o sitios genéricos para turistas. Usa el rating y el tipo de establecimiento como señal, no solo la popularidad.",
  attractions: "Prioriza lugares realmente representativos de la zona, con buena valoración.",
  beaches: "Prioriza playas con buena valoración y accesibilidad.",
  nature: "Prioriza parques y espacios naturales con buena valoración.",
};

// Selects and orders up to `limit` place_ids from real Google Places
// candidates — Claude must not invent or modify any factual data, only
// choose and rank from the list it's given.
export async function curateRecommendations(params: {
  propertyName: string;
  address: string;
  category: string;
  candidates: RecommendationCandidate[];
  limit?: number;
}): Promise<string[]> {
  const limit = params.limit ?? 10;
  const guidance = CURATION_CATEGORY_GUIDANCE[params.category] ?? "";

  const prompt = `
Eres el asistente de ${params.propertyName}, un alojamiento en ${params.address}.

Estos son los lugares candidatos de la categoría "${params.category}" cerca del alojamiento
(datos reales de Google Places — nombre, rating, número de reseñas, tipos):
${JSON.stringify(params.candidates, null, 2)}

Selecciona un máximo de ${limit} lugares y ordénalos de mejor a peor recomendación para un
huésped turístico. ${guidance}

No inventes ni modifiques ningún dato. Solo elige y ordena place_id de la lista proporcionada.

Devuelve SOLO un JSON array de place_id en el orden de recomendación:
["place_id_1", "place_id_2", ...]
`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const ids = extractJson<string[]>(text);
  const validIds = new Set(params.candidates.map((c) => c.place_id));
  return ids.filter((id) => validIds.has(id)).slice(0, limit);
}

export interface PlaceSuggestion {
  name: string;
  description: string;
  address: string;
  distance_meters: number | null;
}

const PLACE_CATEGORY_LABELS: Record<string, string> = {
  parking: "un parking o aparcamiento",
};

export async function generatePlaceSuggestion(params: {
  propertyName: string;
  address: string;
  blockType: string;
  excludeNames: string[];
}): Promise<PlaceSuggestion> {
  const category = PLACE_CATEGORY_LABELS[params.blockType] ?? "un lugar de interés";
  const exclusions =
    params.excludeNames.length > 0
      ? `No sugieras ninguno de estos lugares, que ya están en la lista: ${params.excludeNames.join(", ")}.`
      : "";

  const prompt = `
Eres un asistente que conoce bien la zona de ${params.address}, donde se encuentra el alojamiento "${params.propertyName}".

Sugiere ${category} real y conocido cerca de esa dirección, útil para huéspedes turísticos.
${exclusions}

Devuelve SOLO un JSON con esta estructura exacta:
{
  "name": "Nombre del lugar",
  "description": "Descripción breve en 2 frases: qué lo hace especial, qué pedir o qué hacer allí",
  "address": "Dirección aproximada del lugar",
  "distance_meters": 400
}

"distance_meters" es la distancia aproximada a pie en metros desde ${params.address}, como número entero.
`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return extractJson<PlaceSuggestion>(text);
}

const TRANSLATION_TONE_GUIDANCE = `
Eres el traductor oficial de WelcoKit, una guía digital para huéspedes de alojamientos turísticos.
Tono: cálido, natural y profesional — nunca frío ni literal. Como si un anfitrión atento
le explicara esto en persona a su huésped. No traduzcas palabra por palabra: adapta la
frase para que suene natural en el idioma de destino.
`.trim();

// Plain-text variant — used for property.welcome_message (a single free-text
// field, not a block content object).
export async function translateContentText(
  text: string,
  targetLanguageName: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `${TRANSLATION_TONE_GUIDANCE}

Traduce este texto al ${targetLanguageName}. Devuelve SOLO el texto traducido, sin comillas, sin comentarios ni explicaciones:

${text}`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text.trim() : text;
}

// JSON variant — used for block content, which is a JSON object of
// already-extracted translatable string/string[]/Record<string,string>
// fields (see lib/translations/extract.ts). Keys and structure must come
// back unchanged; only the string values are translated.
export async function translateContentJson(
  content: Record<string, unknown>,
  targetLanguageName: string
): Promise<Record<string, unknown>> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `${TRANSLATION_TONE_GUIDANCE}

Traduce al ${targetLanguageName} todos los valores de texto de este objeto JSON.
Mantén exactamente la misma estructura y las mismas claves — no añadas, quites ni
renombres ninguna clave. Traduce únicamente los valores de tipo texto (incluidos los
que están dentro de arrays o de objetos anidados). Devuelve SOLO el JSON resultante,
sin comentarios, sin explicación, sin bloque de código markdown:

${JSON.stringify(content)}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return extractJson<Record<string, unknown>>(text);
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
