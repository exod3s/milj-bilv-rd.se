import Link from "next/link";
import { Gift, ArrowRight } from "lucide-react";

export function GiftCardSection() {
  return (
    <section className="section-spacing bg-white">
      <div className="container-padded">
        <div className="surface overflow-hidden border-forest-300">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-forest-950 p-8 text-white sm:p-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-forest-300 text-forest-950">
                <Gift size={28} />
              </div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-forest-300">
                Presentkort
              </p>
              <h2 className="text-3xl font-black sm:text-4xl">
                Presentkort finns hos oss
              </h2>
            </div>
            <div className="p-8 sm:p-10">
              <p className="text-lg font-semibold leading-8 text-slate-700">
                Ge bort en renare bil som gåva. Våra presentkort kan användas
                till tvätt, rekond och utvalda behandlingar.
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Just nu hanteras köp via kontaktförfrågan. Onlinebetalning kan
                kopplas in senare utan att ändra upplägget på sidan.
              </p>
              <Link href="/contact" className="button-primary mt-6">
                Köp presentkort
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
