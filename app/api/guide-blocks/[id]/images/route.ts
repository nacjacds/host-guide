import { randomUUID } from "crypto";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blockImageStoragePath } from "@/lib/utils";
import type { BlockImage } from "@/types";

const MAX_IMAGES = 3;
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_WIDTH = 1200;

async function getOwnedBlock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  userId: string
) {
  const { data: block } = await supabase
    .from("guide_blocks")
    .select("id, property_id, title, images")
    .eq("id", id)
    .single();

  if (!block) return null;

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", block.property_id)
    .eq("host_id", userId)
    .single();

  if (!property) return null;

  return block;
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

  const block = await getOwnedBlock(supabase, id, user.id);
  if (!block) {
    return NextResponse.json({ error: "Bloque no encontrado" }, { status: 404 });
  }

  if (block.images.length >= MAX_IMAGES) {
    return NextResponse.json(
      { error: `Cada bloque admite un máximo de ${MAX_IMAGES} imágenes` },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Solo se aceptan imágenes JPG, PNG o WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "La imagen no puede superar 2MB" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let outputBuffer: Buffer;
  let width: number;
  let height: number;
  try {
    const pipeline = sharp(inputBuffer).rotate().resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
    });
    outputBuffer = await pipeline.webp({ quality: 80 }).toBuffer();
    const metadata = await sharp(outputBuffer).metadata();
    width = metadata.width ?? 0;
    height = metadata.height ?? 0;
  } catch {
    return NextResponse.json({ error: "El archivo no es una imagen válida" }, { status: 400 });
  }

  const path = `${block.property_id}/${block.id}/${randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("block-images")
    .upload(path, outputBuffer, { contentType: "image/webp" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("block-images").getPublicUrl(path);

  const image: BlockImage = {
    url: publicUrl,
    alt: block.title ?? "",
    width,
    height,
    caption: "",
  };

  const { error: updateError } = await supabase
    .from("guide_blocks")
    .update({ images: [...block.images, image] })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ image }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Falta el parámetro url" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const block = await getOwnedBlock(supabase, id, user.id);
  if (!block) {
    return NextResponse.json({ error: "Bloque no encontrado" }, { status: 404 });
  }

  const path = blockImageStoragePath(url);
  if (path) {
    await supabase.storage.from("block-images").remove([path]);
  }

  const { error } = await supabase
    .from("guide_blocks")
    .update({ images: block.images.filter((img) => img.url !== url) })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
