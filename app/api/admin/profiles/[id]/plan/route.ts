import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { PLAN_ORDER } from "@/lib/plans";
import { notAuthorizedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { commonApiMessages, pick } from "@/lib/apiMessages";
import type { Plan } from "@/types";

const updatePlanSchema = z.object({
  plan: z.enum(PLAN_ORDER as [string, ...string[]]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    return notAuthorizedResponse(request, supabase, user?.id ?? null);
  }

  const parsed = updatePlanSchema.safeParse(await request.json());
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user!.id);
    return NextResponse.json({ error: commonApiMessages.invalidPlan[locale] }, { status: 400 });
  }

  const serviceClient = createServiceRoleClient();
  const { data: profile, error } = await serviceClient
    .from("profiles")
    .update({ plan: parsed.data.plan as Plan })
    .eq("id", id)
    .select()
    .single();

  if (error || !profile) {
    const locale = await getApiLocale(request, supabase, user!.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo actualizar el plan", "Couldn't update the plan") },
      { status: 400 }
    );
  }

  return NextResponse.json({ profile });
}
