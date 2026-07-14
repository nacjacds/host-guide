import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { generatePrintQrCodeDataUrl, getGuideUrl } from "@/lib/qr";
import { getLogoDataUrl } from "@/lib/pdf/logo";
import { TentCardDocument } from "@/lib/pdf/tent-card";
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
    .select("name, slug, language")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
  }

  const [qrDataUrl, logoDataUrl] = await Promise.all([
    generatePrintQrCodeDataUrl(property.slug),
    getLogoDataUrl(),
  ]);

  const pdfBuffer = await renderToBuffer(
    TentCardDocument({
      propertyName: property.name,
      guideUrl: getGuideUrl(property.slug),
      language: property.language === "en" ? "en" : "es",
      qrDataUrl,
      logoDataUrl,
    })
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="qr-imprimir-${property.slug}.pdf"`,
    },
  });
}
