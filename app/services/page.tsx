import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/ContactCta";
import { GiftCardSection } from "@/components/GiftCardSection";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { serviceCategories } from "@/lib/pricing";
import { readServices } from "@/lib/service-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tjänster för bilvård och rekond",
  description:
    "Se tjänster för biltvätt, invändig rekond, komplett rekond, polering och lackskydd i Örnsköldsvik."
};

const processSteps = [
  "Vi går igenom bilens skick och önskat resultat.",
  "Du får tydligt pris baserat på paket, fordonstyp och tillval.",
  "Bilen behandlas med professionell utrustning och miljöanpassade produkter.",
  "Vi gör en slutkontroll och går igenom resultatet med dig."
];

export default async function ServicesPage() {
  const services = await readServices();

  return (
    <>
      <PageHero
        eyebrow="Tjänster"
        title="Biltvätt, rekond, polering och lackskydd i Örnsköldsvik."
        description="Oavsett om bilen behöver en snabb uppfräschning eller en komplett rekond finns tydliga paket att välja mellan."
      />

      <section className="section-spacing bg-white">
        <div className="container-padded">
          <div className="grid gap-10">
            {serviceCategories.map((category) => {
              const categoryServices = services.filter(
                (service) => service.category === category
              );

              if (categoryServices.length === 0) {
                return null;
              }

              return (
                <div key={category}>
                  <h2 className="mb-5 text-2xl font-black text-forest-950">
                    {category}
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {categoryServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <GiftCardSection />

      <section className="section-spacing bg-polish-mist">
        <div className="container-padded">
          <SectionHeading
            eyebrow="Så går det till"
            title="En enkel process med tydliga steg."
            description="Vi vill att bilvård ska kännas tryggt, begripligt och smidigt från bokning till hämtning."
          />
          <div className="grid gap-4 md:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step} className="surface p-5">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-forest-950 text-sm font-black text-white">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold leading-6 text-slate-700">
                  {step}
                </p>
              </div>
            ))}
          </div>
          <Link href="/booking" className="button-primary mt-8">
            Boka en behandling
          </Link>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
