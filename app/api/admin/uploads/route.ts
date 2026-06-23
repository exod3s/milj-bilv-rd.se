import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
const maxUploadBytes = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Ingen fil uppladdad" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Filen måste vara en bild" },
        { status: 400 }
      );
    }

    if (file.size > maxUploadBytes) {
      return NextResponse.json(
        { ok: false, error: "Bilden får vara högst 10 MB" },
        { status: 413 }
      );
    }

    const extension = path.extname(file.name).toLowerCase() || ".jpg";
    const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        addRandomSuffix: false
      });

      return NextResponse.json({ ok: true, url: blob.url });
    }

    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Bildlagring saknas. Anslut Vercel Blob och lägg till BLOB_READ_WRITE_TOKEN."
        },
        { status: 503 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), bytes);

    return NextResponse.json({ ok: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Gallery image upload failed", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? `Kunde inte ladda upp bilden: ${error.message}`
            : "Kunde inte ladda upp bilden"
      },
      { status: 500 }
    );
  }
}
