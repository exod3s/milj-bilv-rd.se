import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Sparkles, Star } from "lucide-react";
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

      <div className="container-padded relative grid w-full min-w-0 items-center gap-10 py-12 sm:py-16 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-5 flex flex-wrap gap-3">
            <div className="inline-flex max-w-full items-center gap-2 rounded-md bg-forest-300 px-3 py-2 text-xs font-black text-forest-950 shadow-soft sm:text-sm">
              <Sparkles size={16} className="shrink-0" />
              <span className="min-w-0">Premium bilvård i Örnsköldsvik</span>
            </div>
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-md border border-white/20 bg-white/12 px-3 py-2 text-xs font-black text-white backdrop-blur sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
              <span className="rounded bg-white px-2 py-1 text-xs font-black text-slate-700">
                Google
              </span>
              <span className="flex shrink-0 items-center gap-1 text-forest-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
              </span>
              <span>4,9/5</span>
            </div>
          </div>
          <h1 className="max-w-full text-3xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
            Rekond, biltvätt och polering med renare känsla.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-forest-50 sm:text-lg">
            Miljö Bilvård i Ö-vik hjälper dig att få tillbaka glans, fräsch
            interiör och trygg premiumfinish med miljövänliga produkter och
            tydliga priser.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/booking" className="button-primary w-full sm:w-auto">
              Boka nu
            </Link>
            <Link href="/prices" className="button-secondary w-full border-white bg-white text-forest-950 hover:bg-forest-300 hover:text-forest-950 sm:w-auto">
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

        <div className="w-full min-w-0 max-w-full rounded-lg border border-white/20 bg-white p-2 text-forest-950 shadow-soft sm:p-3">
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
