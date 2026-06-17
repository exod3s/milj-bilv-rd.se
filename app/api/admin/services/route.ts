import { NextResponse } from "next/server";
import { serviceCategories, type ServicePackage } from "@/lib/pricing";
import {
  addService,
  deleteService,
  readServices,
  updateService
} from "@/lib/service-store";

export async function GET() {
  return NextResponse.json({ ok: true, services: await readServices() });
}

export async function PATCH(request: Request) {
  try {
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
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Kunde inte spara tjänsten"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const service = (await request.json()) as ServicePackage;

    if (!service.id || !service.name || !service.category) {
      return NextResponse.json(
        { ok: false, error: "ID, namn och kategori krävs" },
        { status: 400 }
      );
    }

    if (!serviceCategories.includes(service.category)) {
      return NextResponse.json(
        { ok: false, error: "Ogiltig kategori" },
        { status: 400 }
      );
    }

    const created = await addService(service);
    return NextResponse.json({ ok: true, service: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Kunde inte skapa tjänsten"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string };

    if (!body.id) {
      return NextResponse.json(
        { ok: false, error: "Service krävs" },
        { status: 400 }
      );
    }

    const deleted = await deleteService(body.id);
    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Kunde inte ta bort tjänsten"
      },
      { status: 500 }
    );
  }
}
