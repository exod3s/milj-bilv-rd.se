import Link from "next/link";
import { Phone } from "lucide-react";
import { businessInfo } from "@/lib/business-info";

export function ContactCta() {
  return (
    <section className="section-spacing bg-forest-950 text-white">
      <div className="container-padded grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-forest-300">
            Redo för en renare bil?
          </p>
          <h2 className="text-3xl font-black sm:text-4xl">
            Boka din bilvård online eller hör av dig om du är osäker.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-forest-50">
            Välj servicepaket, fordonstyp och tid. Du ser totalpriset innan
            bokningen bekräftas.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link href="/booking" className="button-primary">
            Boka nu
          </Link>
          <a
            href={`tel:${businessInfo.phone.replaceAll(" ", "")}`}
            className="button-secondary border-white bg-white text-forest-950 hover:bg-forest-300 hover:text-forest-950"
          >
            <Phone size={16} />
            Ring {businessInfo.phone}
          </a>
          <a
            href={`tel:${businessInfo.secondaryPhone.replaceAll(" ", "")}`}
            className="button-secondary border-white bg-white text-forest-950 hover:bg-forest-300 hover:text-forest-950"
          >
            <Phone size={16} />
            Ring {businessInfo.secondaryPhone}
          </a>
        </div>
      </div>
    </section>
  );
}
