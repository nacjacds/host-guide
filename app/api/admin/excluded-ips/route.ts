import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { notAuthorizedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

// Loose but real IPv4/IPv6 validation — good enough to reject typos
// without being a full RFC parser; the host is adding their own known
// IPs here, not untrusted input.
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_REGEX = /^[0-9a-fA-F:]+$/;

const addExcludedIpSchema = z.object({
  ip_address: z.string().min(3).max(45),
  label: z.string().max(120).optional(),
});

function isValidIp(ip: string): boolean {
  if (IPV4_REGEX.test(ip)) {
    return ip.split(".").every((part) => Number(part) <= 255);
  }
  return IPV6_REGEX.test(ip) && ip.includes(":");
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    return notAuthorizedResponse(request, supabase, user?.id ?? null);
  }

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("analytics_excluded_ips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ excludedIps: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    return notAuthorizedResponse(request, supabase, user?.id ?? null);
  }

  const parsed = addExcludedIpSchema.safeParse(await request.json());
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user!.id);
    return NextResponse.json({ error: pick(locale, "Datos inválidos", "Invalid data") }, { status: 400 });
  }

  if (!isValidIp(parsed.data.ip_address)) {
    const locale = await getApiLocale(request, supabase, user!.id);
    return NextResponse.json(
      { error: pick(locale, "Esa no parece una IP válida", "That doesn't look like a valid IP") },
      { status: 400 }
    );
  }

  const serviceClient = createServiceRoleClient();
  const { data: excludedIp, error } = await serviceClient
    .from("analytics_excluded_ips")
    .insert({ ip_address: parsed.data.ip_address, label: parsed.data.label ?? null })
    .select()
    .single();

  if (error) {
    const locale = await getApiLocale(request, supabase, user!.id);
    const message =
      error.code === "23505"
        ? pick(locale, "Esa IP ya está en la lista", "That IP is already on the list")
        : pick(locale, "No se pudo añadir la IP", "Couldn't add the IP");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ excludedIp }, { status: 201 });
}
