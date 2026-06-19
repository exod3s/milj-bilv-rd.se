import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BookingRecord, BookingStatus } from "@/lib/booking-types";
import { ensureDatabaseSchema, getSql, hasDatabase } from "@/lib/db";

const bookingsFile = path.join(process.cwd(), "data", "bookings.json");

function bookingStart(booking: BookingRecord) {
  return `${booking.date} ${booking.time}:00`;
}

function bookingEnd(booking: BookingRecord) {
  const start = new Date(`${booking.date}T${booking.time}:00`);
  start.setMinutes(start.getMinutes() + (booking.durationMinutes ?? 60));
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")} ${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}:00`;
}

function isBookingConflict(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("booking_time_blocks_time_range_excl") ||
      error.message.includes("conflicting key value violates exclusion constraint"))
  );
}

async function reserveBookingTime(booking: BookingRecord) {
  if (!hasDatabase()) {
    return;
  }

  await ensureDatabaseSchema();
  const sql = getSql();

  try {
    await sql`
      INSERT INTO booking_time_blocks (booking_id, time_range)
      VALUES (
        ${booking.id},
        tsrange(
          ${bookingStart(booking)}::timestamp,
          ${bookingEnd(booking)}::timestamp,
          '[)'
        )
      )
    `;
  } catch (error) {
    if (isBookingConflict(error)) {
      throw new Error("Tiden är inte längre tillgänglig");
    }
    throw error;
  }
}

async function releaseBookingTime(id: string) {
  if (!hasDatabase()) {
    return;
  }

  await ensureDatabaseSchema();
  const sql = getSql();
  await sql`DELETE FROM booking_time_blocks WHERE booking_id = ${id}`;
}

export async function readBookings(): Promise<BookingRecord[]> {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT data
      FROM bookings
      ORDER BY COALESCE((data->>'date'), ''), COALESCE((data->>'time'), '')
    ` as { data: BookingRecord }[];
    return rows.map((row) => row.data);
  }

  try {
    const file = await readFile(bookingsFile, "utf8");
    return JSON.parse(file) as BookingRecord[];
  } catch {
    return [];
  }
}

export async function writeBookings(bookings: BookingRecord[]) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`DELETE FROM bookings`;

    for (const booking of bookings) {
      await sql`
        INSERT INTO bookings (id, data, created_at, updated_at)
        VALUES (
          ${booking.id},
          ${JSON.stringify(booking)}::jsonb,
          ${booking.createdAt}::timestamptz,
          NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }

    return;
  }

  await mkdir(path.dirname(bookingsFile), { recursive: true });
  await writeFile(bookingsFile, JSON.stringify(bookings, null, 2), "utf8");
}

export async function saveBooking(booking: BookingRecord) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await reserveBookingTime(booking);

    try {
      await sql`
        INSERT INTO bookings (id, data, created_at, updated_at)
        VALUES (
          ${booking.id},
          ${JSON.stringify(booking)}::jsonb,
          ${booking.createdAt}::timestamptz,
          NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    } catch (error) {
      await releaseBookingTime(booking.id);
      throw error;
    }
    return;
  }

  const bookings = await readBookings();
  const requestedStart = new Date(`${booking.date}T${booking.time}:00`).getTime();
  const requestedEnd =
    requestedStart + (booking.durationMinutes ?? 60) * 60_000;
  const hasConflict = bookings.some((existing) => {
    if (existing.status === "cancelled") {
      return false;
    }
    const existingStart = new Date(
      `${existing.date}T${existing.time}:00`
    ).getTime();
    const existingEnd =
      existingStart + (existing.durationMinutes ?? 60) * 60_000;
    return requestedStart < existingEnd && existingStart < requestedEnd;
  });

  if (hasConflict) {
    throw new Error("Tiden är inte längre tillgänglig");
  }

  bookings.push(booking);
  await writeBookings(bookings);
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT data FROM bookings WHERE id = ${id} LIMIT 1
    ` as { data: BookingRecord }[];
    const booking = rows[0]?.data;

    if (!booking) {
      throw new Error("Bokningen hittades inte");
    }

    const wasCancelled = booking.status === "cancelled";
    booking.status = status;

    if (!wasCancelled && status === "cancelled") {
      await releaseBookingTime(id);
    } else if (wasCancelled && status !== "cancelled") {
      await reserveBookingTime(booking);
    }

    await sql`
      UPDATE bookings
      SET data = ${JSON.stringify(booking)}::jsonb, updated_at = NOW()
      WHERE id = ${id}
    `;

    return booking;
  }

  const bookings = await readBookings();
  const booking = bookings.find((item) => item.id === id);

  if (!booking) {
    throw new Error("Bokningen hittades inte");
  }

  booking.status = status;
  await writeBookings(bookings);
  return booking;
}

export async function deleteBooking(id: string) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await releaseBookingTime(id);
    const rows = (await sql`
      DELETE FROM bookings
      WHERE id = ${id}
      RETURNING id
    `) as { id: string }[];

    if (!rows[0]) {
      throw new Error("Bokningen hittades inte");
    }

    return;
  }

  const bookings = await readBookings();
  const bookingExists = bookings.some((booking) => booking.id === id);

  if (!bookingExists) {
    throw new Error("Bokningen hittades inte");
  }

  await writeBookings(bookings.filter((booking) => booking.id !== id));
}
