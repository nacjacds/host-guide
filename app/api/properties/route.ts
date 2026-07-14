import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { slugifyPropertyName } from "@/lib/utils";
import { planPropertyLimit } from "@/lib/plans";
import { notAuthenticatedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";
import type { User } from "@supabase/supabase-js";

const createPropertySchema = z.object({
  name: z.string().min(1).max(120),
  address: z.string().min(1).max(255),
});

// Profiles are normally created by the on_auth_user_created DB trigger.
// This is a fallback for accounts that predate the trigger (or any other
// gap), since profiles has no authenticated INSERT policy — a missing row
// here would otherwise block property creation with a FK violation.
async function ensureProfile(user: User) {
  const serviceClient = createServiceRoleClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return profile;

  const { data: created, error } = await serviceClient
    .from("profiles")
    .insert({ id: user.id, full_name: user.user_metadata?.full_name ?? null })
    .select("plan")
    .single();

  if (error) throw error;
  return created;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("host_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ properties: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = createPropertySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  let profile;
  try {
    profile = await ensureProfile(user);
  } catch {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo preparar tu perfil de anfitrión", "Couldn't prepare your host profile") },
      { status: 500 }
    );
  }

  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("host_id", user.id)
    .is("deleted_at", null);

  const limit = planPropertyLimit(profile?.plan);
  if ((count ?? 0) >= limit) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: pick(locale, "Has alcanzado el límite de propiedades de tu plan", "You've reached your plan's property limit") },
      { status: 403 }
    );
  }

  const { name, address } = parsed.data;
  const baseSlug = slugifyPropertyName(name);
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: property, error } = await supabase
    .from("properties")
    .insert({ host_id: user.id, name, address, slug })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ property }, { status: 201 });
}
