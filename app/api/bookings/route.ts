import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { BookingRecord } from "@/lib/booking-types";
import { bookingRequestSchema } from "@/lib/booking-types";
import { sendAdminBookingEmail, sendCustomerConfirmationEmail } from "@/lib/email";
import { createCalendarEvent, getAvailableSlots } from "@/lib/google-calendar";
import { calculateBookingPrice, getServicePackage, getVehicleType } from "@/lib/pricing";

export const runtime = "nodejs";

const bookingsFile = path.join(process.cwd(), "data", "bookings.json");

async function readBookings(): Promise<BookingRecord[]> {
  try {
    const file = await readFile(bookingsFile, "utf8");
    return JSON.parse(file) as BookingRecord[];
  } catch {
    return [];
  }
}

async function saveBooking(booking: BookingRecord) {
  await mkdir(path.dirname(bookingsFile), { recursive: true });
  const bookings = await readBookings();
  bookings.push(booking);
  await writeFile(bookingsFile, JSON.stringify(bookings, null, 2), "utf8");
}

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

    const price = calculateBookingPrice({
      serviceId: bookingInput.serviceId,
      vehicleTypeId: bookingInput.vehicleTypeId,
      extras: bookingInput.extras
    });
    const service = getServicePackage(bookingInput.serviceId);
    const vehicleType = getVehicleType(bookingInput.vehicleTypeId);

    const booking: BookingRecord = {
      ...bookingInput,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      price,
      status: "confirmed"
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
