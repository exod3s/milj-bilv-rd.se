import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
  try {
    const file = await readFile(galleryFile, "utf8");
    return JSON.parse(file) as GalleryItem[];
  } catch {
    return [];
  }
}

export async function writeGallery(items: GalleryItem[]) {
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
  await writeGallery(items);
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
  await writeGallery(items);
  return item;
}
