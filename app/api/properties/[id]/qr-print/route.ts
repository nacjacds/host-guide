import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { generatePrintQrCodeDataUrl, getGuideUrl } from "@/lib/qr";
import { getLogoDataUrl } from "@/lib/pdf/logo";
import { TentCardDocument } from "@/lib/pdf/tent-card";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: property } = await supabase
    .from("properties")
    .select("name, slug, language")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
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
