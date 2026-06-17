import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/ContactCta";
import { CampaignOffers } from "@/components/CampaignOffers";
import { GalleryPreview } from "@/components/GalleryPreview";
import { GiftCardSection } from "@/components/GiftCardSection";
import { Hero } from "@/components/Hero";
import { PricingTable } from "@/components/PricingTable";
import { PhotoMosaic } from "@/components/PhotoMosaic";
import { ReviewsSection } from "@/components/ReviewsSection";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { TrustBadges } from "@/components/TrustBadges";
import { getAvailableSlots } from "@/lib/google-calendar";
import { readServices } from "@/lib/service-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bilvård, rekond och biltvätt i Örnsköldsvik",
  description:
    "Boka bilvård i Örnsköldsvik hos Miljö Bilvård i Ö-vik. Rekond, biltvätt, polering, invändig rengöring och lackskydd med tydliga priser."
};

export default async function HomePage() {
  const availableSlots = await getAvailableSlots();
  const services = await readServices();

  return (
    <>
      <CampaignOffers compact />

      <Hero availableSlots={availableSlots} services={services} />

      <section className="section-spacing bg-white">
        <div className="container-padded">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Våra tjänster"
              title="Bilvård som känns både ren och genomtänkt."
              description="Välj mellan snabbare tvätt, invändig rengöring, komplett rekond och premiumbehandlingar för lacken."
            />
            <Link href="/services" className="button-secondary mb-10 w-fit">
              Alla tjänster
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.filter((service) => service.bookable).slice(0, 3).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <PhotoMosaic />

      <section className="section-spacing bg-polish-mist">
        <div className="container-padded">
          <SectionHeading
            eyebrow="Prispreview"
            title="Tydliga priser innan du bokar."
            description="Baspriset visas direkt. I bokningen läggs fordonstillägg och tillval på automatiskt så att totalpriset blir tydligt."
          />
          <PricingTable services={services} />
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-padded">
          <SectionHeading
            eyebrow="Före och efter"
            title="Förberett galleri för riktiga kundbilar."
            description="Bildkorten är byggda för före- och efterbilder så att verksamhetens egna resultat enkelt kan läggas in senare."
          />
          <GalleryPreview />
        </div>
      </section>

      <section className="section-spacing bg-polish-mist">
        <div className="container-padded">
          <SectionHeading
            eyebrow="Google-recensioner"
            title="Vad våra kunder säger"
            description="Mockade recensioner visas tills Google Places API kopplas in. Komponenten är förberedd för riktig rating, namn och recensionstexter."
          />
          <ReviewsSection />
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-padded">
          <SectionHeading
            eyebrow="Därför väljer kunder oss"
            title="Trygg bilvård med premiumkänsla."
            description="Små detaljer, tydlig kommunikation och miljömedvetna produkter gör stor skillnad."
          />
          <TrustBadges />
        </div>
      </section>

      <CampaignOffers />

      <GiftCardSection />

      <ContactCta />
    </>
  );
}
