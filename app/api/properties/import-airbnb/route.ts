import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notAuthenticatedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

const importSchema = z.object({ url: z.string().url() });

const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'");
}

// Only allow fetching airbnb.<tld> listing pages — this endpoint proxies a
// server-side fetch of a user-supplied URL, so restricting the host avoids
// turning it into an open SSRF-style fetcher for arbitrary URLs.
function isAirbnbUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && /(^|\.)airbnb\.[a-z.]+$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = importSchema.safeParse(await request.json());
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: pick(locale, "URL inválida", "Invalid URL") }, { status: 400 });
  }

  const { url } = parsed.data;
  if (!isAirbnbUrl(url)) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "Introduce una URL de un anuncio de Airbnb (airbnb.com/...)",
          "Enter the URL of an Airbnb listing (airbnb.com/...)"
        ),
      },
      { status: 400 }
    );
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const locale = await getApiLocale(request, supabase, user.id);
      return NextResponse.json(
        {
          error: pick(
            locale,
            "Airbnb no respondió correctamente (puede estar bloqueando el acceso). Rellena los datos manualmente.",
            "Airbnb didn't respond correctly (it may be blocking access). Fill in the details manually."
          ),
        },
        { status: 502 }
      );
    }
    html = await response.text();
  } catch {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "No se pudo acceder a la URL. Rellena los datos manualmente.",
          "Couldn't access the URL. Fill in the details manually."
        ),
      },
      { status: 502 }
    );
  }

  const titleMatch =
    html.match(/<meta property="og:title" content="([^"]*)"/i) ??
    html.match(/<title>([^<]*)<\/title>/i);
  const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/i);

  const rawTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]) : null;
  const description = descriptionMatch ? decodeHtmlEntities(descriptionMatch[1]) : null;

  // Airbnb serves these with a 200 status (SPA shell), so response.ok above
  // doesn't catch them — the room ID doesn't exist or the listing is gone.
  if (rawTitle && /^\s*(404|page not found|not found)\b/i.test(rawTitle)) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "Este anuncio no existe o ya no está disponible. Rellena los datos manualmente.",
          "This listing doesn't exist or is no longer available. Fill in the details manually."
        ),
      },
      { status: 422 }
    );
  }

  if (!rawTitle) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "No se pudo extraer información de este anuncio. Airbnb puede estar bloqueando el acceso — rellena los datos manualmente.",
          "Couldn't extract information from this listing. Airbnb may be blocking access — fill in the details manually."
        ),
      },
      { status: 422 }
    );
  }

  // Airbnb og:title is typically "<Room type> in <City, Country> - <headline>"
  // — a best-effort approximation, never a precise street address.
  const locationMatch = rawTitle.match(/ in ([^-]+?)(?:\s*-|\s*$)/i);
  const address = locationMatch ? locationMatch[1].trim() : null;
  const title = rawTitle.replace(/\s*-\s*Airbnb$/i, "").trim();

  // Everything below is best-effort: Airbnb listing pages are heavily
  // client-rendered, so these numbers/times are only found when they happen
  // to appear in the server-rendered HTML (og:description, embedded JSON,
  // or visible summary text). Any of these can legitimately come back null —
  // the UI shows only what was found and lets the host fill in the rest.
  const searchText = `${description ?? ""} ${html}`;

  function matchNumber(patterns: RegExp[]): number | null {
    for (const pattern of patterns) {
      const match = searchText.match(pattern);
      if (match) return Math.round(parseFloat(match[1]));
    }
    return null;
  }

  function matchTime(patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = searchText.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  }

  const maxGuests = matchNumber([/(\d+)\s*(?:guests?|hu[ée]spedes?)/i]);
  let bedrooms = matchNumber([/(\d+)\s*(?:bedrooms?|habitaciones?|dormitorios?)/i]);
  if (bedrooms === null && /\bstudio\b/i.test(searchText)) bedrooms = 0;
  const bathrooms = matchNumber([/(\d+(?:\.\d+)?)\s*(?:baths?|bathrooms?|ba[ñn]os?)/i]);

  const checkinTime = matchTime([
    /check-?in[^0-9]{0,25}(\d{1,2}(?::\d{2})?\s?(?:am|pm)?)/i,
    /entrada[^0-9]{0,25}(\d{1,2}(?::\d{2})?\s?(?:h|am|pm)?)/i,
  ]);
  const checkoutTime = matchTime([
    /check-?out[^0-9]{0,25}(\d{1,2}(?::\d{2})?\s?(?:am|pm)?)/i,
    /salida[^0-9]{0,25}(\d{1,2}(?::\d{2})?\s?(?:h|am|pm)?)/i,
  ]);

  // Labels seeded in the host's active dashboard locale at import time
  // (same mechanism as getApiLocale everywhere else in this file) rather
  // than always Spanish — same bug class as the block-title-locale fix
  // for new guide_blocks (see app/api/properties/[id]/blocks/route.ts).
  const rulesLocale = await getApiLocale(request, supabase, user.id);
  const KNOWN_RULES: { pattern: RegExp; label: { es: string; en: string } }[] = [
    { pattern: /no smoking/i, label: { es: "No fumar", en: "No smoking" } },
    { pattern: /no pets/i, label: { es: "No se admiten mascotas", en: "No pets allowed" } },
    {
      pattern: /no parties or events/i,
      label: { es: "No se permiten fiestas ni eventos", en: "No parties or events" },
    },
    {
      pattern: /no unregistered guests/i,
      label: { es: "No huéspedes no registrados", en: "No unregistered guests" },
    },
    { pattern: /quiet hours/i, label: { es: "Horas de silencio", en: "Quiet hours" } },
    { pattern: /no fumar/i, label: { es: "No fumar", en: "No smoking" } },
    {
      pattern: /no se admiten mascotas/i,
      label: { es: "No se admiten mascotas", en: "No pets allowed" },
    },
    {
      pattern: /no fiestas/i,
      label: { es: "No se permiten fiestas ni eventos", en: "No parties or events" },
    },
  ];
  const houseRules = Array.from(
    new Set(
      KNOWN_RULES.filter((rule) => rule.pattern.test(searchText)).map(
        (rule) => rule.label[rulesLocale === "es" ? "es" : "en"]
      )
    )
  );

  return NextResponse.json({
    title,
    description,
    address,
    max_guests: maxGuests,
    bedrooms,
    bathrooms,
    checkin_time: checkinTime,
    checkout_time: checkoutTime,
    house_rules: houseRules,
  });
}
