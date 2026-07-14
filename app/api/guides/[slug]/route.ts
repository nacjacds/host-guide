import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notFoundResponse } from "@/lib/apiResponses";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !property) {
    return notFoundResponse(request, supabase, null, "guide");
  }

  const [{ data: blocks }, { data: recommendations }] = await Promise.all([
    supabase
      .from("guide_blocks")
      .select("*")
      .eq("property_id", property.id)
      .eq("is_visible", true)
      .order("order_index"),
    supabase
      .from("recommendations")
      .select("*")
      .eq("property_id", property.id)
      .eq("is_visible", true)
      .order("order_index"),
  ]);

  return NextResponse.json({ property, blocks, recommendations });
}
