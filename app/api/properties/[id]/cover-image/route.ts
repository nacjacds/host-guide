import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { coverImageStoragePath } from "@/lib/utils";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import {
  apiMessage,
  acceptedImageTypesMessage,
  imageTooLargeMessage,
  JPG_ONLY_LABEL,
} from "@/lib/apiMessages";

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
    return notAuthenticatedResponse(request, supabase);
  }

  const property = await getOwnedProperty(supabase, id, user.id);
  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: apiMessage("noFileReceived", locale) }, { status: 400 });
  }

  if (file.type !== "image/jpeg") {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: acceptedImageTypesMessage(JPG_ONLY_LABEL, locale) },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: imageTooLargeMessage(3, locale) }, { status: 400 });
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
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: apiMessage("notValidImage", locale) }, { status: 400 });
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

  const property = await getOwnedProperty(supabase, id, user.id);
  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
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
