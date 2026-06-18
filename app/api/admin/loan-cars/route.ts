import { NextResponse } from "next/server";
import { loanCarIds, type LoanCarId } from "@/lib/booking-types";
import {
  createLoanCarBlock,
  deleteLoanCarBlock,
  getLoanCarReservations,
  readLoanCarBlocks
} from "@/lib/loan-car-store";
import { loanCars } from "@/lib/loan-cars";

export const dynamic = "force-dynamic";

export async function GET() {
  const [blocks, reservations] = await Promise.all([
    readLoanCarBlocks(),
    getLoanCarReservations()
  ]);

  return NextResponse.json({ ok: true, cars: loanCars, blocks, reservations });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      loanCarId?: LoanCarId;
      startAt?: string;
      endAt?: string;
      note?: string;
    };

    if (
      !body.loanCarId ||
      !loanCarIds.includes(body.loanCarId) ||
      !body.startAt ||
      !body.endAt
    ) {
      return NextResponse.json(
        { ok: false, error: "Lånebil, starttid och sluttid krävs" },
        { status: 400 }
      );
    }

    const block = await createLoanCarBlock({
      loanCarId: body.loanCarId,
      startAt: body.startAt,
      endAt: body.endAt,
      note: body.note?.trim() || "Manuellt blockerad"
    });

    return NextResponse.json({ ok: true, block });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Kunde inte blockera lånebilen"
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Blockeringens id krävs" },
      { status: 400 }
    );
  }

  await deleteLoanCarBlock(id);
  return NextResponse.json({ ok: true });
}
