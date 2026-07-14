import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateGuideQrCode } from "@/lib/qr";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const { data: property } = await supabase
    .from("properties")
    .select("slug")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
  }

  const dataUrl = await generateGuideQrCode(property.slug);
  return NextResponse.json({ dataUrl });
}
