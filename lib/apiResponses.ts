import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import { getApiLocale } from "@/lib/apiLocale";
import { apiMessage, notFoundMessage, type NotFoundEntity } from "@/lib/apiMessages";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Convenience wrappers around getApiLocale() + NextResponse.json() for the
// two most common error shapes (~55 call sites combined) — turns the
// previous `NextResponse.json({ error: "No autenticado" }, { status: 401 })`
// one-liner-per-route into a single shared call.

// userId is always null here in practice (this fires exactly when
// supabase.auth.getUser() came back empty), so getApiLocale falls
// straight through to the NEXT_LOCALE cookie — no DB round-trip.
export async function notAuthenticatedResponse(
  request: NextRequest,
  supabase: SupabaseServerClient
) {
  const locale = await getApiLocale(request, supabase, null);
  return NextResponse.json({ error: apiMessage("notAuthenticated", locale) }, { status: 401 });
}

export async function notAuthorizedResponse(
  request: NextRequest,
  supabase: SupabaseServerClient,
  userId: string | null,
  status: 401 | 403 = 403
) {
  const locale = await getApiLocale(request, supabase, userId);
  return NextResponse.json({ error: apiMessage("notAuthorized", locale) }, { status });
}

export async function notFoundResponse(
  request: NextRequest,
  supabase: SupabaseServerClient,
  userId: string | null,
  entity: NotFoundEntity
) {
  const locale = await getApiLocale(request, supabase, userId);
  return NextResponse.json({ error: notFoundMessage(entity, locale) }, { status: 404 });
}
