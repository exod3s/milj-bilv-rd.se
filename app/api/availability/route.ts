import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/google-calendar";
import { readServices } from "@/lib/service-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const services = await readServices();
  const service = services.find(
    (item) => item.id === serviceId && item.bookable
  );

  if (!service) {
    return NextResponse.json(
      { ok: false, error: "Välj ett giltigt servicepaket" },
      { status: 400 }
    );
  }

  const slots = await getAvailableSlots(service.durationMinutes);
  return NextResponse.json({ ok: true, slots });
}
