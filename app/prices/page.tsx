import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { PricingTable } from "@/components/PricingTable";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Priser för biltvätt, rekond och polering",
  description:
    "Prislista för biltvätt, invändig rekond, komplett rekond, polering och lackskydd i Örnsköldsvik."
};

export default function PricesPage() {
  return (
    <>
      <PageHero
        eyebrow="Priser"
        title="Tydliga priser för bilvård i Örnsköldsvik."
        description="Välj paket, fordonstyp och tillval. På bokningssidan visas totalpriset innan du bekräftar."
      />

      <section className="section-spacing bg-white">
        <div className="container-padded">
          <PricingTable />
        </div>
      </section>

      <section className="section-spacing bg-polish-mist">
        <div className="container-padded">
          <SectionHeading
            eyebrow="Bra att veta"
            title="Pris kan påverkas av skick och omfattning."
            description="Bokningssystemet räknar ut standardpris enligt konfigurerade regler. Vid särskilda behov kontaktar vi dig innan arbetet påbörjas."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Hundhår lägger till 200 kr.",
              "Extra smutsig interiör lägger till 300 kr.",
              "Upphämtning och lämning är en förfrågan utan automatiskt pris."
            ].map((note) => (
              <div key={note} className="surface p-5">
                <p className="font-semibold leading-7 text-slate-700">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
