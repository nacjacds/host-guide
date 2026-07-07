import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = importSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const { url } = parsed.data;
  if (!isAirbnbUrl(url)) {
    return NextResponse.json(
      { error: "Introduce una URL de un anuncio de Airbnb (airbnb.com/...)" },
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
      return NextResponse.json(
        {
          error:
            "Airbnb no respondió correctamente (puede estar bloqueando el acceso). Rellena los datos manualmente.",
        },
        { status: 502 }
      );
    }
    html = await response.text();
  } catch {
    return NextResponse.json(
      { error: "No se pudo acceder a la URL. Rellena los datos manualmente." },
      { status: 502 }
    );
  }

  const titleMatch =
    html.match(/<meta property="og:title" content="([^"]*)"/i) ??
    html.match(/<title>([^<]*)<\/title>/i);
  const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/i);

  const rawTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]) : null;
  const description = descriptionMatch ? decodeHtmlEntities(descriptionMatch[1]) : null;

  if (!rawTitle) {
    return NextResponse.json(
      {
        error:
          "No se pudo extraer información de este anuncio. Airbnb puede estar bloqueando el acceso — rellena los datos manualmente.",
      },
      { status: 422 }
    );
  }

  // Airbnb og:title is typically "<Room type> in <City, Country> - <headline>"
  // — a best-effort approximation, never a precise street address.
  const locationMatch = rawTitle.match(/ in ([^-]+?)(?:\s*-|\s*$)/i);
  const address = locationMatch ? locationMatch[1].trim() : null;
  const title = rawTitle.replace(/\s*-\s*Airbnb$/i, "").trim();

  return NextResponse.json({ title, description, address });
}
