import type { Metadata } from "next";
import Image from "next/image";
import { ContactCta } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustBadges } from "@/components/TrustBadges";

export const metadata: Metadata = {
  title: "Om Miljö Bilvård i Ö-vik",
  description:
    "Lär känna Miljö Bilvård i Ö-vik, ett lokalt bilvårdsföretag i Örnsköldsvik med fokus på miljövänliga produkter och professionellt resultat."
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Om oss"
        title="Lokal bilvård med premiumfinish och miljötänk."
        description="Miljö Bilvård i Ö-vik är skapat för kunder som vill ha en renare, fräschare och mer välvårdad bil utan krångliga processer."
      />

      <section className="section-spacing bg-white">
        <div className="container-padded grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=85"
              alt="Välvårdad bil utanför bilvårdsanläggning"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow="Vår idé"
              title="Bilvård ska vara tydlig, noggrann och enkel att boka."
              description="Vi kombinerar professionell utrustning med skonsamma metoder och tydliga servicepaket. Målet är att kunden alltid ska veta vad som ingår, vad det kostar och vad nästa steg är."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Lokalt fokus", "Vi finns i Örnsköldsvik och bygger förtroende genom tydlig service."],
                ["Premiumkänsla", "Varje behandling avslutas med kontroll av finish och detaljer."],
                ["Miljömedvetet", "Produktval och arbetsflöden är utformade för renare resultat med omtanke."],
                ["Smidig bokning", "Bokningssystemet visar pris och tid innan du bekräftar."]
              ].map(([title, text]) => (
                <div key={title} className="rounded-lg border border-forest-100 bg-polish-mist p-5">
                  <h3 className="font-black text-forest-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-polish-mist">
        <div className="container-padded">
          <SectionHeading
            eyebrow="Trygghet"
            title="Det här kan du förvänta dig."
            description="Vi arbetar strukturerat, kommunicerar tydligt och använder produkter som passar modern bilvård."
          />
          <TrustBadges />
        </div>
      </section>

      <ContactCta />
    </>
  );
}
