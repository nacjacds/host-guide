import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { coverImageStoragePath } from "@/lib/utils";

const MAX_SIZE_BYTES = 3 * 1024 * 1024;
const MAX_WIDTH = 1920;

async function getOwnedProperty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  userId: string
) {
  const { data: property } = await supabase
    .from("properties")
    .select("id, cover_image_url")
    .eq("id", id)
    .eq("host_id", userId)
    .single();

  return property;
}

export async function POST(
  request: NextRequest,
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

  const property = await getOwnedProperty(supabase, id, user.id);
  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  if (file.type !== "image/jpeg") {
    return NextResponse.json({ error: "Solo se aceptan imágenes JPG" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "La imagen no puede superar 3MB" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "El archivo no es una imagen válida" }, { status: 400 });
  }

  const path = `${id}/cover.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("cover-images")
    .upload(path, outputBuffer, { contentType: "image/jpeg", upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("cover-images").getPublicUrl(path);
  const coverImageUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("properties")
    .update({ cover_image_url: coverImageUrl })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ cover_image_url: coverImageUrl });
}

export async function DELETE(
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

  const property = await getOwnedProperty(supabase, id, user.id);
  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  if (property.cover_image_url) {
    const path = coverImageStoragePath(property.cover_image_url);
    if (path) {
      await supabase.storage.from("cover-images").remove([path]);
    }
  }

  const { error } = await supabase
    .from("properties")
    .update({ cover_image_url: null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
