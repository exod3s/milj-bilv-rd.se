import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BookingRecord, BookingStatus } from "@/lib/booking-types";
import { ensureDatabaseSchema, getSql, hasDatabase } from "@/lib/db";

const bookingsFile = path.join(process.cwd(), "data", "bookings.json");

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
    return;
  }

  const bookings = await readBookings();
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

    booking.status = status;

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
