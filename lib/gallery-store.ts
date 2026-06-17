import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureDatabaseSchema, getSql, hasDatabase } from "@/lib/db";

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  published: boolean;
  createdAt: string;
};

const galleryFile = path.join(process.cwd(), "data", "gallery.json");

export async function readGallery(): Promise<GalleryItem[]> {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT data
      FROM gallery_items
      ORDER BY created_at DESC
    ` as { data: GalleryItem }[];
    return rows.map((row) => row.data);
  }

  try {
    const file = await readFile(galleryFile, "utf8");
    return JSON.parse(file) as GalleryItem[];
  } catch {
    return [];
  }
}

export async function writeGallery(items: GalleryItem[]) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`DELETE FROM gallery_items`;

    for (const item of items) {
      await sql`
        INSERT INTO gallery_items (id, data, created_at, updated_at)
        VALUES (
          ${item.id},
          ${JSON.stringify(item)}::jsonb,
          ${item.createdAt}::timestamptz,
          NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }

    return;
  }

  await mkdir(path.dirname(galleryFile), { recursive: true });
  await writeFile(galleryFile, JSON.stringify(items, null, 2), "utf8");
}

export async function addGalleryItem(
  item: Omit<GalleryItem, "id" | "createdAt">
) {
  const items = await readGallery();
  const galleryItem: GalleryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  items.unshift(galleryItem);
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`
      INSERT INTO gallery_items (id, data, created_at, updated_at)
      VALUES (
        ${galleryItem.id},
        ${JSON.stringify(galleryItem)}::jsonb,
        ${galleryItem.createdAt}::timestamptz,
        NOW()
      )
    `;
  } else {
    await writeGallery(items);
  }

  return galleryItem;
}

export async function updateGalleryItem(
  id: string,
  patch: Partial<Omit<GalleryItem, "id" | "createdAt">>
) {
  const items = await readGallery();
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    throw new Error("Galleribilden hittades inte");
  }

  Object.assign(item, patch);

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    await sql`
      UPDATE gallery_items
      SET data = ${JSON.stringify(item)}::jsonb, updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await writeGallery(items);
  }

  return item;
}
