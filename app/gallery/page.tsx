import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { GalleryPreview } from "@/components/GalleryPreview";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Galleri med före och efter bilvård",
  description:
    "Galleri för före- och efterbilder från rekond, polering, lackskydd och invändig bilvård i Örnsköldsvik."
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Galleri"
        title="Före och efter från rekond, polering och lackskydd."
        description="Här kan riktiga kundbilder läggas in senare. Korten är redan strukturerade för före/efter-flöden."
      />

      <section className="section-spacing bg-white">
        <div className="container-padded">
          <GalleryPreview showAll />
        </div>
      </section>

      <ContactCta />
    </>
  );
}
