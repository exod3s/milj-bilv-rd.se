import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { businessInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt och öppettider",
  description:
    "Kontakta Miljö Bilvård i Ö-vik för bilvård, rekond, biltvätt och polering i Örnsköldsvik. Se adress, telefon, e-post och öppettider."
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title="Kontakta oss eller boka din bilvård online."
        description="Har du frågor om paket, skick på bilen eller lånebil? Hör av dig så hjälper vi dig välja rätt behandling."
      />

      <section className="section-spacing bg-white">
        <div className="container-padded grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-5">
            <div className="surface p-5">
              <h2 className="text-2xl font-black text-forest-950">
                Kontaktuppgifter
              </h2>
              <div className="mt-5 grid gap-4 text-sm font-semibold text-slate-700">
                <p className="flex gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-forest-700" />
                  {businessInfo.address}
                </p>
                <a
                  href={`tel:${businessInfo.phone.replaceAll(" ", "")}`}
                  className="flex gap-3 hover:text-forest-800"
                >
                  <Phone size={18} className="mt-0.5 shrink-0 text-forest-700" />
                  {businessInfo.phone}
                </a>
                <a
                  href={`mailto:${businessInfo.email}`}
                  className="flex gap-3 hover:text-forest-800"
                >
                  <Mail size={18} className="mt-0.5 shrink-0 text-forest-700" />
                  {businessInfo.email}
                </a>
              </div>
            </div>

            <div className="surface p-5">
              <h2 className="text-2xl font-black text-forest-950">Öppettider</h2>
              <div className="mt-5 grid gap-3">
                {businessInfo.openingHours.map((row) => (
                  <div
                    key={row.day}
                    className="flex items-center justify-between border-b border-forest-100 pb-3 text-sm last:border-0 last:pb-0"
                  >
                    <span className="font-semibold text-slate-700">{row.day}</span>
                    <span className="font-black text-forest-950">{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Hitta hit"
              title="Google Maps-plats förberedd."
              description="Byt ut iframe-källan mot verksamhetens riktiga Google Maps-inbäddning när adressen är fastställd."
            />
            <div className="surface overflow-hidden">
              <iframe
                title="Google Maps karta för Miljö Bilvård i Ö-vik"
                src="https://www.google.com/maps?q=%C3%96rnsk%C3%B6ldsvik%2C%20Sweden&output=embed"
                className="h-[24rem] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
