import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import type { ServicePackage } from "@/lib/pricing";
import { formatCurrency } from "@/lib/pricing";

type ServiceCardProps = {
  service: ServicePackage;
};

const categoryImages: Record<string, string> = {
  Biltvättspaket:
    "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=85",
  Rekondpaket:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85",
  "Övriga Behandlingar":
    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=85",
  Däckverksamhet:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85",
  Husbil:
    "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=85",
  Presentkort:
    "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=85",
  Rabatter:
    "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=85"
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="surface flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-forest-300">
      <div className="relative aspect-[16/10] overflow-hidden bg-forest-950">
        <Image
          src={categoryImages[service.category]}
          alt={`${service.name} hos Miljö Bilvård i Ö-vik`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 rounded-md bg-forest-300 px-3 py-2 text-sm font-black text-forest-950">
          {"originalPrice" in service && service.originalPrice ? (
            <span className="mr-2 text-xs line-through opacity-75">
              {formatCurrency(service.originalPrice)}
            </span>
          ) : null}
          från {formatCurrency(service.basePrice)}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-forest-950">{service.name}</h3>
            <p className="mt-1 flex items-center gap-2 text-sm font-black text-forest-700">
              <Clock size={16} />
              {service.duration}
            </p>
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-600">{service.description}</p>
        <div className="mt-5 grid gap-2">
          {service.highlights.map((highlight) => (
            <span
              key={highlight}
              className="rounded-md bg-polish-mist px-3 py-2 text-sm font-black text-forest-950"
            >
              {highlight}
            </span>
          ))}
        </div>
        <Link
          href={service.bookable ? `/booking?service=${service.id}` : "/contact"}
          className="mt-6 inline-flex items-center gap-2 text-sm font-black text-forest-700 hover:text-forest-950"
        >
          {service.bookable ? `Boka ${service.name.toLowerCase()}` : "Kontakta oss"}
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
