import { NextResponse } from "next/server";
import type { BookingRecord } from "@/lib/booking-types";
import { bookingRequestSchema } from "@/lib/booking-types";
import { saveBooking } from "@/lib/booking-store";
import { sendAdminBookingEmail, sendCustomerConfirmationEmail } from "@/lib/email";
import { createCalendarEvent, getAvailableSlots } from "@/lib/google-calendar";
import { calculateBookingPriceFromCatalog, getVehicleType } from "@/lib/pricing";
import { readServices } from "@/lib/service-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Ogiltig bokningsdata"
        },
        { status: 400 }
      );
    }

    const bookingInput = parsed.data;
    const availableSlots = await getAvailableSlots();
    const slotIsAvailable = availableSlots.some(
      (slot) =>
        slot.available &&
        slot.date === bookingInput.date &&
        slot.time === bookingInput.time
    );

    if (!slotIsAvailable) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tiden är inte längre tillgänglig. Välj en annan tid."
        },
        { status: 409 }
      );
    }

    const services = await readServices();
    const price = calculateBookingPriceFromCatalog(services, {
      serviceId: bookingInput.serviceId,
      vehicleTypeId: bookingInput.vehicleTypeId,
      extras: bookingInput.extras
    });
    const service = services.find((item) => item.id === bookingInput.serviceId);
    const vehicleType = getVehicleType(bookingInput.vehicleTypeId);

    const booking: BookingRecord = {
      ...bookingInput,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      price,
      status: "new",
      serviceName: service?.name,
      vehicleTypeName: vehicleType?.name,
      duration: service?.duration,
      durationMinutes: service?.durationMinutes
    };

    await saveBooking(booking);
    await createCalendarEvent(booking);
    await sendAdminBookingEmail(booking);
    await sendCustomerConfirmationEmail(booking);

    return NextResponse.json({
      ok: true,
      booking: {
        id: booking.id,
        service: service?.name ?? booking.serviceId,
        vehicleType: vehicleType?.name ?? booking.vehicleTypeId,
        duration: service?.duration ?? "-",
        date: booking.date,
        time: booking.time,
        price: booking.price
      }
    });
  } catch (error) {
    console.error("Booking API error", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Bokningen kunde inte sparas just nu. Försök igen senare."
      },
      { status: 500 }
    );
  }
}
