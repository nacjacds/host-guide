import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autocompletePlaces } from "@/lib/google-places";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get("input")?.trim() ?? "";
  const propertyId = searchParams.get("propertyId") ?? "";

  if (input.length < 3 || !propertyId) {
    return NextResponse.json({ suggestions: [] });
  }

  const { data: property } = await supabase
    .from("properties")
    .select("lat, lng")
    .eq("id", propertyId)
    .eq("host_id", user.id)
    .single();

  if (!property?.lat || !property?.lng) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await autocompletePlaces(input, { lat: property.lat, lng: property.lng });
  return NextResponse.json({ suggestions });
}
