import type { BlockType, PlaceEntry } from "@/types";

// What a block's saved content is reduced to before it's ever sent to
// Claude — only human-language prose, never times, phone numbers, wifi
// credentials, URLs, or other non-linguistic values. This is also exactly
// the shape stored in content_translations.translated_content.
export interface TranslatablePayload {
  title?: string | null;
  fields: Record<string, string | string[] | Record<string, string>>;
}

// Returns null when a block/type has nothing worth translating (e.g. wifi
// credentials, or a block whose translatable fields are all empty) — the
// caller should skip calling translateContent entirely in that case.
export function extractTranslatable(
  blockType: BlockType,
  content: Record<string, unknown>,
  title?: string | null
): TranslatablePayload | null {
  switch (blockType) {
    case "checkin":
    case "checkout": {
      const instructions = content.instructions;
      if (typeof instructions !== "string" || !instructions.trim()) return null;
      return { fields: { instructions } };
    }

    case "rules":
    case "parking":
    case "appliances":
    case "pool": {
      const rules = content.rules;
      if (!Array.isArray(rules) || rules.length === 0) return null;
      const nonEmpty = rules.filter((r): r is string => typeof r === "string" && r.trim().length > 0);
      if (nonEmpty.length === 0) return null;
      return { fields: { rules: nonEmpty } };
    }

    case "custom": {
      const text = content.text;
      const fields: TranslatablePayload["fields"] = {};
      if (typeof text === "string" && text.trim()) fields.text = text;
      if (!title?.trim() && Object.keys(fields).length === 0) return null;
      return { title: title ?? null, fields };
    }

    case "emergencias": {
      const notes = content.notes;
      if (typeof notes !== "string" || !notes.trim()) return null;
      return { fields: { notes } };
    }

    case "restaurants":
    case "drinks":
    case "nightlife":
    case "attractions": {
      const places = content.places;
      if (!Array.isArray(places) || places.length === 0) return null;
      const descriptions: Record<string, string> = {};
      for (const place of places as PlaceEntry[]) {
        if (place?.id && place.description?.trim()) {
          descriptions[place.id] = place.description;
        }
      }
      if (Object.keys(descriptions).length === 0) return null;
      return { fields: { places_description: descriptions } };
    }

    // wifi has no translatable prose — network_name/password are literal
    // credentials, never language-dependent.
    case "wifi":
    default:
      return null;
  }
}

// Rebuilds a display-ready content object: the original content with only
// the translated fields swapped in. Everything else (time, phone numbers,
// images, maps_url, price_level, google_place_id...) comes from the
// original, untouched.
export function mergeTranslatedContent(
  blockType: BlockType,
  content: Record<string, unknown>,
  translatedFields: TranslatablePayload["fields"] | undefined | null
): Record<string, unknown> {
  if (!translatedFields) return content;

  switch (blockType) {
    case "checkin":
    case "checkout": {
      const instructions = translatedFields.instructions;
      return typeof instructions === "string" ? { ...content, instructions } : content;
    }

    case "rules":
    case "parking":
    case "appliances":
    case "pool": {
      const rules = translatedFields.rules;
      return Array.isArray(rules) ? { ...content, rules } : content;
    }

    case "custom": {
      const text = translatedFields.text;
      return typeof text === "string" ? { ...content, text } : content;
    }

    case "emergencias": {
      const notes = translatedFields.notes;
      return typeof notes === "string" ? { ...content, notes } : content;
    }

    case "restaurants":
    case "drinks":
    case "nightlife":
    case "attractions": {
      const descriptions = translatedFields.places_description;
      const places = content.places;
      if (!descriptions || typeof descriptions !== "object" || !Array.isArray(places)) {
        return content;
      }
      const descMap = descriptions as Record<string, string>;
      const translatedPlaces = (places as PlaceEntry[]).map((place) =>
        place?.id && descMap[place.id] ? { ...place, description: descMap[place.id] } : place
      );
      return { ...content, places: translatedPlaces };
    }

    default:
      return content;
  }
}
