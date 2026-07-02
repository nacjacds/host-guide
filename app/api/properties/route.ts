import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugifyPropertyName } from "@/lib/utils";

const PLAN_LIMITS = { free: 1, basic: 3, pro: Infinity } as const;

const createPropertySchema = z.object({
  name: z.string().min(1).max(120),
  address: z.string().min(1).max(255),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("host_id", user.id)
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
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = createPropertySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("host_id", user.id);

  const limit = PLAN_LIMITS[profile?.plan ?? "free"];
  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      { error: "Has alcanzado el límite de propiedades de tu plan" },
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
