import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { GalleryPreview } from "@/components/GalleryPreview";
import { PageHero } from "@/components/PageHero";
import { readGallery } from "@/lib/gallery-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galleri med före och efter bilvård",
  description:
    "Galleri för före- och efterbilder från rekond, polering, lackskydd och invändig bilvård i Örnsköldsvik."
};

export default async function GalleryPage() {
  const galleryItems = (await readGallery())
    .filter((item) => item.published)
    .map((item) => ({
      title: item.title,
      category: item.category,
      beforeImage: item.beforeImage,
      afterImage: item.afterImage,
      description: item.description
    }));

  return (
    <>
      <PageHero
        eyebrow="Galleri"
        title="Före och efter från rekond, polering och lackskydd."
        description="Här kan riktiga kundbilder läggas in senare. Korten är redan strukturerade för före/efter-flöden."
      />

      <section className="section-spacing bg-white">
        <div className="container-padded">
          <GalleryPreview showAll items={galleryItems} />
        </div>
      </section>

      <ContactCta />
    </>
  );
}
