import { NextResponse } from "next/server";
import { bookingStatuses, type BookingStatus } from "@/lib/booking-types";
import { readBookings, updateBookingStatus } from "@/lib/booking-store";

export async function GET() {
  return NextResponse.json({ ok: true, bookings: await readBookings() });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id?: string; status?: BookingStatus };

  if (!body.id || !body.status || !bookingStatuses.includes(body.status)) {
    return NextResponse.json(
      { ok: false, error: "Bokning och giltig status krävs" },
      { status: 400 }
    );
  }

  const booking = await updateBookingStatus(body.id, body.status);
  return NextResponse.json({ ok: true, booking });
}
