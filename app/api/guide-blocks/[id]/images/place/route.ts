import { randomUUID } from "crypto";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blockImageStoragePath } from "@/lib/utils";
import type { BlockImage, PlaceEntry } from "@/types";

const MAX_IMAGES = 3;
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_WIDTH = 1200;

interface PlaceListContent {
  places: PlaceEntry[];
}

async function getOwnedBlock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  userId: string
) {
  const { data: block } = await supabase
    .from("guide_blocks")
    .select("id, property_id, content")
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

  const formData = await request.formData();
  const file = formData.get("file");
  const placeId = formData.get("placeId");

  if (typeof placeId !== "string" || !placeId) {
    return NextResponse.json({ error: "Falta el lugar" }, { status: 400 });
  }

  const content = block.content as unknown as PlaceListContent;
  const places = content.places ?? [];
  const placeIndex = places.findIndex((p) => p.id === placeId);
  if (placeIndex === -1) {
    return NextResponse.json({ error: "Lugar no encontrado" }, { status: 404 });
  }

  const existingImages = places[placeIndex].images ?? [];
  if (existingImages.length >= MAX_IMAGES) {
    return NextResponse.json(
      { error: `Cada lugar admite un máximo de ${MAX_IMAGES} imágenes` },
      { status: 400 }
    );
  }

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

  const path = `${block.property_id}/${block.id}/places/${placeId}/${randomUUID()}.webp`;

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
    alt: places[placeIndex].name ?? "",
    width,
    height,
    caption: "",
  };

  const nextPlaces = [...places];
  nextPlaces[placeIndex] = { ...nextPlaces[placeIndex], images: [...existingImages, image] };

  const { error: updateError } = await supabase
    .from("guide_blocks")
    .update({ content: { ...content, places: nextPlaces } })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ image, places: nextPlaces }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = request.nextUrl.searchParams.get("url");
  const placeId = request.nextUrl.searchParams.get("placeId");

  if (!url || !placeId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
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

  const content = block.content as unknown as PlaceListContent;
  const places = content.places ?? [];
  const placeIndex = places.findIndex((p) => p.id === placeId);
  if (placeIndex === -1) {
    return NextResponse.json({ error: "Lugar no encontrado" }, { status: 404 });
  }

  const path = blockImageStoragePath(url);
  if (path) {
    await supabase.storage.from("block-images").remove([path]);
  }

  const nextPlaces = [...places];
  nextPlaces[placeIndex] = {
    ...nextPlaces[placeIndex],
    images: (nextPlaces[placeIndex].images ?? []).filter((img) => img.url !== url),
  };

  const { error } = await supabase
    .from("guide_blocks")
    .update({ content: { ...content, places: nextPlaces } })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ places: nextPlaces });
}
