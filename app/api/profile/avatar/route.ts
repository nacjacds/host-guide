import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { avatarStoragePath } from "@/lib/utils";
import { notAuthenticatedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import {
  commonApiMessages,
  acceptedImageTypesMessage,
  imageTooLargeMessage,
  JPG_PNG_WEBP_LABEL,
} from "@/lib/apiMessages";

const MAX_SIZE_BYTES = 1 * 1024 * 1024;
const AVATAR_SIZE = 200;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
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
    return NextResponse.json({ error: imageTooLargeMessage(1, locale) }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: commonApiMessages.notValidImage[locale] }, { status: 400 });
  }

  const path = `${user.id}/avatar.webp`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, outputBuffer, { contentType: "image/webp", upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ avatar_url: avatarUrl });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.avatar_url) {
    const path = avatarStoragePath(profile.avatar_url);
    if (path) {
      await supabase.storage.from("avatars").remove([path]);
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
