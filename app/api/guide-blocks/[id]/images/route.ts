import { randomUUID } from "crypto";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blockImageStoragePath } from "@/lib/utils";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import {
  commonApiMessages,
  acceptedImageTypesMessage,
  imageTooLargeMessage,
  pick,
  JPG_PNG_WEBP_LABEL,
} from "@/lib/apiMessages";
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
    return notAuthenticatedResponse(request, supabase);
  }

  const block = await getOwnedBlock(supabase, id, user.id);
  if (!block) {
    return notFoundResponse(request, supabase, user.id, "block");
  }

  if (block.images.length >= MAX_IMAGES) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          `Cada bloque admite un máximo de ${MAX_IMAGES} imágenes`,
          `Each block allows up to ${MAX_IMAGES} images`
        ),
      },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: commonApiMessages.noFileReceived[locale] }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: acceptedImageTypesMessage(JPG_PNG_WEBP_LABEL, locale) },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: imageTooLargeMessage(2, locale) }, { status: 400 });
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
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: commonApiMessages.notValidImage[locale] }, { status: 400 });
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!url) {
    const locale = await getApiLocale(request, supabase, user?.id ?? null);
    return NextResponse.json(
      { error: pick(locale, "Falta el parámetro url", "Missing url parameter") },
      { status: 400 }
    );
  }

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const block = await getOwnedBlock(supabase, id, user.id);
  if (!block) {
    return notFoundResponse(request, supabase, user.id, "block");
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
