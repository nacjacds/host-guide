import { createClient } from "@/lib/supabase/server";
import { getGuideUrl } from "@/lib/qr";
import { BookingsList, type BookingRow } from "@/components/dashboard/bookings/BookingsList";

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, slug")
    .eq("host_id", user!.id)
    .order("name");

  const propertyIds = (properties ?? []).map((p) => p.id);

  const { data: checkinBlocks } =
    propertyIds.length > 0
      ? await supabase
          .from("guide_blocks")
          .select("property_id, content")
          .eq("type", "checkin")
          .in("property_id", propertyIds)
      : { data: [] };

  const checkinTimeByProperty = new Map<string, string | null>();
  for (const block of checkinBlocks ?? []) {
    const time = (block.content as { time?: string } | null)?.time ?? null;
    checkinTimeByProperty.set(block.property_id, time);
  }

  const propertiesById: Record<
    string,
    { name: string; guideUrl: string; checkinTime: string | null }
  > = {};
  for (const property of properties ?? []) {
    propertiesById[property.id] = {
      name: property.name,
      guideUrl: getGuideUrl(property.slug),
      checkinTime: checkinTimeByProperty.get(property.id) ?? null,
    };
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("host_id", user!.id)
    .order("checkin_date", { ascending: false });

  const initialRows: BookingRow[] = (bookings ?? [])
    .filter((booking) => propertiesById[booking.property_id])
    .map((booking) => ({
      id: booking.id,
      propertyId: booking.property_id,
      propertyName: propertiesById[booking.property_id].name,
      guideUrl: propertiesById[booking.property_id].guideUrl,
      checkinTime: propertiesById[booking.property_id].checkinTime,
      guestName: booking.guest_name,
      guestLanguage: booking.guest_language,
      checkinDate: booking.checkin_date,
      checkoutDate: booking.checkout_date,
      status: booking.status,
      welcomeEmailSentAt: booking.welcome_email_sent_at,
    }));

  if (propertyIds.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Reservas</h1>
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Crea primero una propiedad para poder añadir reservas.
        </p>
      </div>
    );
  }

  return <BookingsList initialRows={initialRows} propertiesById={propertiesById} />;
}
