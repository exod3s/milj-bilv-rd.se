import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Sparkles } from "lucide-react";
import { BookingForm } from "@/components/BookingForm";
import type { AvailableSlot } from "@/lib/booking-types";
import type { ServicePackage } from "@/lib/pricing";

type HeroProps = {
  availableSlots: AvailableSlot[];
  services: ServicePackage[];
};

export function Hero({ availableSlots, services }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-forest-950 text-white">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1800&q=90"
          alt="Bil som tvättas med lödder och vatten i professionell bilvårdsmiljö"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-58"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/82 to-forest-950/35" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-forest-950 to-transparent" />
      </div>

      <div className="container-padded relative grid min-h-[calc(100vh-4rem)] items-center gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-forest-300 px-3 py-2 text-sm font-black text-forest-950 shadow-soft">
            <Sparkles size={16} />
            Premium bilvård i Örnsköldsvik
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
            Rekond, biltvätt och polering med renare känsla.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-forest-50 sm:text-lg">
            Miljö Bilvård i Ö-vik hjälper dig att få tillbaka glans, fräsch
            interiör och trygg premiumfinish med miljövänliga produkter och
            tydliga priser.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/booking" className="button-primary">
              Boka nu
            </Link>
            <Link href="/prices" className="button-secondary border-white bg-white text-forest-950 hover:bg-forest-300 hover:text-forest-950">
              Se priser
            </Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-forest-50 sm:grid-cols-3">
            {["Lånebil finns", "Nöjd kund-garanti", "Onlinebokning"].map(
              (item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-forest-300" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/20 bg-white p-3 text-forest-950 shadow-soft">
          <div className="mb-3 rounded-md bg-forest-950 px-4 py-3 text-white">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-forest-300">
              Boka direkt
            </p>
            <p className="mt-1 text-lg font-black">
              Välj paket och se totalpris direkt.
            </p>
          </div>
          <BookingForm availableSlots={availableSlots} services={services} variant="hero" />
        </div>
      </div>
    </section>
  );
}
