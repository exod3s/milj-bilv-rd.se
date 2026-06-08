import { NextResponse } from "next/server";
import { lookupVehicleByRegistrationNumber } from "@/lib/vehicle-lookup";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plate = searchParams.get("plate") ?? "";
  const vehicle = await lookupVehicleByRegistrationNumber(plate);

  if (!vehicle) {
    return NextResponse.json(
      {
        ok: false,
        error: "Vi hittade ingen fordonsinformation för registreringsnumret."
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    vehicle
  });
}
