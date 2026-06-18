import { NextResponse } from "next/server";
import { bookingStatuses, type BookingStatus } from "@/lib/booking-types";
import {
  deleteBooking,
  readBookings,
  updateBookingStatus
} from "@/lib/booking-store";
import { sendCustomerStatusEmail } from "@/lib/email";

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

  try {
    const booking = await updateBookingStatus(body.id, body.status);
    await sendCustomerStatusEmail(booking, body.status);
    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Kunde inte uppdatera bokningen"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Bokningens id krävs" },
      { status: 400 }
    );
  }

  try {
    await deleteBooking(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Kunde inte ta bort bokningen"
      },
      { status: 500 }
    );
  }
}
