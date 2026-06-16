import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent } from "lucide-react";
import type { ServicePackageId } from "@/lib/booking-types";
import { formatCurrency } from "@/lib/pricing";

export const campaignOffers = [
  {
    id: "deluxe-maskinvaxning",
    sectionLabel: "Kampanj",
    name: "Deluxe med maskinfixning",
    title: "Deluxe med maskinfixning",
    oldPrice: 3000,
    currentPrice: 1495,
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=90"
  },
  {
    id: "summer-discount",
    sectionLabel: "Rabatter",
    name: "Sommarrabatt",
    title: "Utvändig tvätt med polish, maskinfix och motortvätt",
    oldPrice: 5600,
    currentPrice: 2799,
    image:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=90"
  }
] as const satisfies ReadonlyArray<{
  id: ServicePackageId;
  sectionLabel: string;
  name: string;
  title: string;
  oldPrice: number;
  currentPrice: number;
  image: string;
}>;

type CampaignOffersProps = {
  compact?: boolean;
};

export function CampaignOffers({ compact = false }: CampaignOffersProps) {
  return (
    <section className={compact ? "bg-white py-8" : "section-spacing bg-white"}>
      <div className="container-padded">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">Rabatter</p>
            <h2 className="text-3xl font-black leading-tight text-forest-950 sm:text-4xl">
              Aktuella erbjudanden
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Två utvalda kampanjer med tydliga priser och snabb bokning direkt
            från startsidan.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {campaignOffers.map((offer) => (
            <article
              key={offer.id}
              className="surface overflow-hidden border-forest-300"
            >
              <div className="relative aspect-[16/9] bg-forest-950">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-md bg-forest-300 px-3 py-2 text-sm font-black text-forest-950">
                  <BadgePercent size={17} />
                  {offer.name}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-forest-700">
                  {offer.sectionLabel}
                </p>
                <h3 className="mt-2 text-2xl font-black leading-tight text-forest-950">
                  {offer.title}
                </h3>
                <div className="mt-5 flex flex-wrap items-end gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      Ordinarie pris
                    </p>
                    <p className="text-xl font-black text-slate-500 line-through">
                      {formatCurrency(offer.oldPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-forest-700">
                      Nu endast
                    </p>
                    <p className="text-4xl font-black text-forest-950">
                      {formatCurrency(offer.currentPrice)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/booking?service=${offer.id}`}
                  className="button-primary mt-6"
                >
                  Boka nu
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
