"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import type { GalleryItem } from "@/lib/gallery-store";
import { galleryItems } from "@/components/GalleryPreview";

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    body: formData
  });
  const result = (await response.json()) as {
    ok: boolean;
    url?: string;
    error?: string;
  };

  if (!response.ok || !result.ok || !result.url) {
    throw new Error(result.error ?? "Kunde inte ladda upp bilden");
  }

  return result.url;
}

export function AdminGalleryManager({
  initialItems
}: {
  initialItems: GalleryItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [slot, setSlot] = useState(1);
  const [title, setTitle] = useState(galleryItems[0]?.title ?? "");
  const [category, setCategory] = useState(galleryItems[0]?.category ?? "");
  const [description, setDescription] = useState(
    galleryItems[0]?.description ?? ""
  );
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const beforeImage = beforeFile ? await uploadFile(beforeFile) : "";
      const afterImage = afterFile ? await uploadFile(afterFile) : "";
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot,
          title,
          category,
          description,
          beforeImage,
          afterImage,
          published: true
        })
      });
      const result = (await response.json()) as {
        ok: boolean;
        item?: GalleryItem;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.item) {
        throw new Error(result.error ?? "Kunde inte spara galleripost");
      }

      setItems((current) => [
        result.item!,
        ...current.filter((item) => item.id !== result.item?.id)
      ]);
      setTitle("");
      setDescription("");
      setBeforeFile(null);
      setAfterFile(null);
      setMessage(`Box ${slot} uppdaterades.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kunde inte spara");
    } finally {
      setLoading(false);
    }
  }

  async function togglePublished(item: GalleryItem) {
    const response = await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        patch: { published: !item.published }
      })
    });
    const result = (await response.json()) as {
      ok: boolean;
      item?: GalleryItem;
    };

    if (response.ok && result.ok && result.item) {
      setItems((current) =>
        current.map((entry) => (entry.id === result.item?.id ? result.item : entry))
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <form onSubmit={createItem} className="surface h-fit p-5">
        <h2 className="text-xl font-black text-forest-950">
          Uppdatera galleribox
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Välj vilken av de tre publika före/efter-boxarna som ska ersättas.
        </p>
        <label className="mt-4 block">
          <span className="field-label">Välj box</span>
          <select
            className="field-input mt-2"
            value={slot}
            onChange={(event) => {
              const nextSlot = Number(event.target.value);
              setSlot(nextSlot);
              const existing =
                items.find((item) => item.slot === nextSlot) ??
                galleryItems.find((item) => item.slot === nextSlot);

              if (existing) {
                setTitle(existing.title);
                setCategory(existing.category);
                setDescription(existing.description ?? "");
              }
            }}
          >
            {galleryItems.map((item) => (
              <option key={item.slot} value={item.slot}>
                Box {item.slot}: {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="field-label">Titel</span>
          <input
            className="field-input mt-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Kategori</span>
          <input
            className="field-input mt-2"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Kort beskrivning</span>
          <textarea
            className="field-input mt-2 min-h-24"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Före bild</span>
          <input
            className="field-input mt-2"
            type="file"
            accept="image/*"
            onChange={(event) => setBeforeFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Efter bild</span>
          <input
            className="field-input mt-2"
            type="file"
            accept="image/*"
            onChange={(event) => setAfterFile(event.target.files?.[0] ?? null)}
          />
        </label>
        {message ? (
          <p className="mt-4 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-bold text-forest-800">
            {message}
          </p>
        ) : null}
        <button className="button-primary mt-5 w-full" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Spara galleri
        </button>
      </form>

      <div className="grid gap-4">
        {galleryItems.map((fallback) => {
          const item = items.find((entry) => entry.slot === fallback.slot) ?? {
            id: `fallback-${fallback.slot}`,
            slot: fallback.slot,
            title: fallback.title,
            category: fallback.category,
            beforeImage: fallback.beforeImage,
            afterImage: fallback.afterImage,
            description:
              fallback.description ??
              "Standardbild. Ladda upp nya före/efterbilder för att ersätta denna box.",
            published: true,
            createdAt: ""
          };

          return (
          <article key={item.id} className="surface overflow-hidden">
            <div className="bg-forest-950 px-5 py-3 text-sm font-black text-white">
              Box {item.slot}
            </div>
            <div className="grid sm:grid-cols-2">
              {[item.beforeImage, item.afterImage].map((image, index) => (
                <div key={`${item.id}-${index}`} className="relative aspect-video bg-slate-200">
                  {image ? (
                    <Image src={image} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-slate-500">
                      {index === 0 ? "Före bild saknas" : "Efter bild saknas"}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-forest-950">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-forest-700">
                    {item.category}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => togglePublished(item)}
                  disabled={item.id.startsWith("fallback-")}
                >
                  {item.published ? "Avpublicera" : "Publicera"}
                </button>
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}
