import { NextRequest, NextResponse } from "next/server";

// Proxies Google Place Photos so the API key never reaches the browser.
// `name` is the raw Places API (New) photo resource name (e.g.
// "places/ChIJ.../photos/AeJ...") stored verbatim in property_recommendations
// as the un-prefixed part of photo_url — see buildPhotoUrl in
// lib/google-places.ts, which stores this route's URL directly.
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Falta el parámetro name" }, { status: 400 });
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=480&key=${process.env.GOOGLE_PLACES_API_KEY}`
  );

  if (!response.ok || !response.body) {
    return NextResponse.json({ error: "No se pudo cargar la imagen" }, { status: 502 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
