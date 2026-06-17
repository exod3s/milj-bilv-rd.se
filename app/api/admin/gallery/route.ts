import { NextResponse } from "next/server";
import { addGalleryItem, readGallery, updateGalleryItem } from "@/lib/gallery-store";

export async function GET() {
  return NextResponse.json({ ok: true, items: await readGallery() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slot?: number;
    title?: string;
    category?: string;
    beforeImage?: string;
    afterImage?: string;
    description?: string;
    published?: boolean;
  };

  if (!body.title || !body.category) {
    return NextResponse.json(
      { ok: false, error: "Titel och kategori krävs" },
      { status: 400 }
    );
  }

  const item = await addGalleryItem({
    title: body.title,
    slot: body.slot,
    category: body.category,
    beforeImage: body.beforeImage ?? "",
    afterImage: body.afterImage ?? "",
    description: body.description ?? "",
    published: Boolean(body.published)
  });

  return NextResponse.json({ ok: true, item });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    patch?: {
      title?: string;
      slot?: number;
      category?: string;
      beforeImage?: string;
      afterImage?: string;
      description?: string;
      published?: boolean;
    };
  };

  if (!body.id || !body.patch) {
    return NextResponse.json(
      { ok: false, error: "Galleripost och ändringar krävs" },
      { status: 400 }
    );
  }

  const item = await updateGalleryItem(body.id, body.patch);
  return NextResponse.json({ ok: true, item });
}
