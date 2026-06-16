import { NextResponse } from "next/server";
import { serviceCategories, type ServicePackage } from "@/lib/pricing";
import { readServices, updateService } from "@/lib/service-store";

export async function GET() {
  return NextResponse.json({ ok: true, services: await readServices() });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    patch?: Partial<ServicePackage>;
  };

  if (!body.id || !body.patch) {
    return NextResponse.json(
      { ok: false, error: "Service och ändringar krävs" },
      { status: 400 }
    );
  }

  if (
    body.patch.category &&
    !serviceCategories.includes(body.patch.category)
  ) {
    return NextResponse.json(
      { ok: false, error: "Ogiltig kategori" },
      { status: 400 }
    );
  }

  const service = await updateService(body.id, body.patch);
  return NextResponse.json({ ok: true, service });
}
