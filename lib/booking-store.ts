import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BookingRecord, BookingStatus } from "@/lib/booking-types";

const bookingsFile = path.join(process.cwd(), "data", "bookings.json");

export async function readBookings(): Promise<BookingRecord[]> {
  try {
    const file = await readFile(bookingsFile, "utf8");
    return JSON.parse(file) as BookingRecord[];
  } catch {
    return [];
  }
}

export async function writeBookings(bookings: BookingRecord[]) {
  await mkdir(path.dirname(bookingsFile), { recursive: true });
  await writeFile(bookingsFile, JSON.stringify(bookings, null, 2), "utf8");
}

export async function saveBooking(booking: BookingRecord) {
  const bookings = await readBookings();
  bookings.push(booking);
  await writeBookings(bookings);
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const bookings = await readBookings();
  const booking = bookings.find((item) => item.id === id);

  if (!booking) {
    throw new Error("Bokningen hittades inte");
  }

  booking.status = status;
  await writeBookings(bookings);
  return booking;
}
