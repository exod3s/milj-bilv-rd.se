import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type GalleryPreviewItem = {
  slot?: number;
  title: string;
  category: string;
  beforeImage: string;
  afterImage: string;
  description?: string;
};

export const galleryItems: GalleryPreviewItem[] = [
  {
    slot: 1,
    title: "Lacklyft efter polering",
    category: "Polering",
    beforeImage:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
  },
  {
    slot: 2,
    title: "Fräsch kupé efter invändig rekond",
    category: "Invändig rengöring",
    beforeImage:
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80"
  },
  {
    slot: 3,
    title: "Skyddad finish efter lackskydd",
    category: "Lackskydd",
    beforeImage:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=80"
  }
];

type GalleryPreviewProps = {
  showAll?: boolean;
  items?: GalleryPreviewItem[];
};

export function GalleryPreview({
  showAll = false,
  items: customItems
}: GalleryPreviewProps) {
  const sourceItems = customItems && customItems.length > 0 ? customItems : galleryItems;
  const customBySlot = new Map(
    (customItems ?? [])
      .filter((item) => item.slot)
      .map((item) => [item.slot, item])
  );
  const mergedSlots = galleryItems.map(
    (fallback) => customBySlot.get(fallback.slot) ?? fallback
  );
  const items = showAll
    ? mergedSlots
    : (customItems && customItems.length > 0 ? sourceItems : galleryItems).slice(0, 3);

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="surface overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={item.beforeImage}
                  alt={`Före: ${item.title}`}
                  fill
                  sizes="(min-width: 768px) 17vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute left-2 top-2 rounded-md bg-forest-950/90 px-2 py-1 text-xs font-black text-white">
                  Före
                </span>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={item.afterImage}
                  alt={`Efter: ${item.title}`}
                  fill
                  sizes="(min-width: 768px) 17vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute left-2 top-2 rounded-md bg-forest-300 px-2 py-1 text-xs font-black text-forest-950">
                  Efter
                </span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-forest-600">
                {item.category}
              </p>
              <h3 className="mt-2 font-black text-forest-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description ??
                  "Bildkortet är förberett för riktiga före- och efterbilder när verksamhetens egna bilder läggs in."}
              </p>
            </div>
          </article>
        ))}
      </div>
      {!showAll ? (
        <Link
          href="/gallery"
          className="mt-7 inline-flex items-center gap-2 text-sm font-black text-forest-700 hover:text-forest-950"
        >
          Se fler exempel
          <ArrowRight size={16} />
        </Link>
      ) : null}
    </div>
  );
}
