import { NextResponse } from "next/server";
import { getLoanCarAvailability } from "@/lib/loan-car-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const durationMinutes = Number(searchParams.get("durationMinutes"));

  if (
    !date ||
    !time ||
    !Number.isFinite(durationMinutes) ||
    durationMinutes < 1
  ) {
    return NextResponse.json(
      { ok: false, error: "Datum, tid och varaktighet krävs" },
      { status: 400 }
    );
  }

  const cars = await getLoanCarAvailability({
    date,
    time,
    durationMinutes
  });

  return NextResponse.json({ ok: true, cars });
}
