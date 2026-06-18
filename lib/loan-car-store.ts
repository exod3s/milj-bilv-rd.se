import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  BookingRecord,
  LoanCarAvailability,
  LoanCarId
} from "@/lib/booking-types";
import { readBookings } from "@/lib/booking-store";
import { ensureDatabaseSchema, getSql, hasDatabase } from "@/lib/db";
import { loanCars } from "@/lib/loan-cars";

export type LoanCarBlock = {
  id: string;
  loanCarId: LoanCarId;
  startAt: string;
  endAt: string;
  note: string;
  createdAt: string;
};

const blocksFile = path.join(process.cwd(), "data", "loan-car-blocks.json");

function toMinutes(value: string) {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute) / 60000;
}

export function bookingTimeRange(
  date: string,
  time: string,
  durationMinutes: number
) {
  const startAt = `${date}T${time}`;
  const end = new Date(toMinutes(startAt) * 60000);
  end.setUTCMinutes(end.getUTCMinutes() + durationMinutes);

  return {
    startAt,
    endAt: `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, "0")}-${String(end.getUTCDate()).padStart(2, "0")}T${String(end.getUTCHours()).padStart(2, "0")}:${String(end.getUTCMinutes()).padStart(2, "0")}`
  };
}

function overlaps(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string
) {
  return (
    toMinutes(firstStart) < toMinutes(secondEnd) &&
    toMinutes(secondStart) < toMinutes(firstEnd)
  );
}

function bookingRange(booking: BookingRecord) {
  return bookingTimeRange(
    booking.date,
    booking.time,
    booking.durationMinutes ?? 60
  );
}

export async function readLoanCarBlocks(): Promise<LoanCarBlock[]> {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT data
      FROM loan_car_blocks
      ORDER BY COALESCE(data->>'startAt', '')
    `) as { data: LoanCarBlock }[];
    return rows.map((row) => row.data);
  }

  try {
    return JSON.parse(await readFile(blocksFile, "utf8")) as LoanCarBlock[];
  } catch {
    return [];
  }
}

async function writeLoanCarBlocks(blocks: LoanCarBlock[]) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`DELETE FROM loan_car_blocks`;

    for (const block of blocks) {
      await sql`
        INSERT INTO loan_car_blocks (id, data, created_at, updated_at)
        VALUES (
          ${block.id},
          ${JSON.stringify(block)}::jsonb,
          ${block.createdAt}::timestamptz,
          NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }
    return;
  }

  await mkdir(path.dirname(blocksFile), { recursive: true });
  await writeFile(blocksFile, JSON.stringify(blocks, null, 2), "utf8");
}

export async function createLoanCarBlock(
  input: Omit<LoanCarBlock, "id" | "createdAt">
) {
  if (toMinutes(input.endAt) <= toMinutes(input.startAt)) {
    throw new Error("Sluttiden måste vara efter starttiden");
  }

  const block: LoanCarBlock = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`
      INSERT INTO loan_car_blocks (id, data, created_at, updated_at)
      VALUES (
        ${block.id},
        ${JSON.stringify(block)}::jsonb,
        ${block.createdAt}::timestamptz,
        NOW()
      )
    `;
    return block;
  }

  const blocks = await readLoanCarBlocks();
  blocks.push(block);
  await writeLoanCarBlocks(blocks);
  return block;
}

export async function deleteLoanCarBlock(id: string) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`DELETE FROM loan_car_blocks WHERE id = ${id}`;
    return;
  }

  const blocks = await readLoanCarBlocks();
  await writeLoanCarBlocks(blocks.filter((block) => block.id !== id));
}

export async function getLoanCarAvailability({
  date,
  time,
  durationMinutes,
  excludeBookingId
}: {
  date: string;
  time: string;
  durationMinutes: number;
  excludeBookingId?: string;
}): Promise<LoanCarAvailability[]> {
  const requested = bookingTimeRange(date, time, durationMinutes);
  const [bookings, blocks] = await Promise.all([
    readBookings(),
    readLoanCarBlocks()
  ]);

  return loanCars.map((car) => {
    const bookingConflict = bookings.find((booking) => {
      if (
        booking.id === excludeBookingId ||
        booking.status === "cancelled" ||
        booking.loanCarId !== car.id
      ) {
        return false;
      }

      const existing = bookingRange(booking);
      return overlaps(
        requested.startAt,
        requested.endAt,
        existing.startAt,
        existing.endAt
      );
    });

    if (bookingConflict) {
      return {
        ...car,
        available: false,
        unavailableReason: "Redan bokad under den valda tiden"
      };
    }

    const manualConflict = blocks.find(
      (block) =>
        block.loanCarId === car.id &&
        overlaps(
          requested.startAt,
          requested.endAt,
          block.startAt,
          block.endAt
        )
    );

    if (manualConflict) {
      return {
        ...car,
        available: false,
        unavailableReason: manualConflict.note || "Manuellt blockerad"
      };
    }

    return { ...car, available: true };
  });
}

export async function getLoanCarReservations() {
  const bookings = await readBookings();
  return bookings
    .filter(
      (booking) => booking.loanCarId && booking.status !== "cancelled"
    )
    .map((booking) => ({
      bookingId: booking.id,
      loanCarId: booking.loanCarId!,
      customerName: booking.customer.name,
      registrationNumber: booking.customer.licensePlate,
      serviceName: booking.serviceName ?? booking.serviceId,
      ...bookingRange(booking)
    }));
}
