import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Sparkles } from "lucide-react";

export function Hero() {
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

      <div className="container-padded relative grid min-h-[calc(100vh-4rem)] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
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

        <div className="surface border-white/15 bg-white/10 p-4 backdrop-blur">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            <Image
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=90"
              alt="Blank sportbil med stark premiumkänsla efter bilvård"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-3">
            {[
              ["4.9/5", "kundbetyg"],
              ["24 h", "svarstid"],
              ["100%", "tydligt pris"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-md bg-white p-4 text-forest-950">
                <p className="text-2xl font-black">{value}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
