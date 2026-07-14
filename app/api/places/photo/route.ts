import { NextRequest, NextResponse } from "next/server";
import { parseLocale, LOCALE_COOKIE_NAME } from "@/lib/locale";
import { pick } from "@/lib/apiMessages";

// Proxies Google Place Photos so the API key never reaches the browser.
// `name` is the raw Places API (New) photo resource name (e.g.
// "places/ChIJ.../photos/AeJ...") stored verbatim in property_recommendations
// as the un-prefixed part of photo_url — see buildPhotoUrl in
// lib/google-places.ts, which stores this route's URL directly. No user
// session exists here (this is an <img src>, called from both the host
// dashboard and the guest guide), so locale comes straight from the
// NEXT_LOCALE cookie rather than getApiLocale's DB lookup — not that it
// matters much in practice, since a browser <img> tag never surfaces this
// JSON error body to anyone.
export async function GET(request: NextRequest) {
  const locale = parseLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value);
  const name = request.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json(
      { error: pick(locale, "Falta el parámetro name", "Missing name parameter") },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=480&key=${process.env.GOOGLE_MAPS_SERVER_KEY}`
  );

  if (!response.ok || !response.body) {
    return NextResponse.json(
      { error: pick(locale, "No se pudo cargar la imagen", "Couldn't load the image") },
      { status: 502 }
    );
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
