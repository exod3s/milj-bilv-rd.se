import Link from "next/link";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { businessInfo } from "@/lib/business-info";
import { navItems } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-forest-950 text-white">
      <div className="container-padded grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo className="h-16 w-16" />
            <div>
              <p className="font-black">{businessInfo.name}</p>
              <p className="text-sm text-forest-100">
                Bilvård, rekond och polering i Örnsköldsvik.
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-forest-100">
            Premiumkänsla med miljömedvetna produkter, professionell utrustning
            och tydlig onlinebokning.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-md bg-forest-300 px-3 py-2 text-sm font-black text-forest-950">
            <Leaf size={16} />
            Miljövänliga produkter
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-forest-300">
            Navigering
          </p>
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-forest-50 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="text-sm font-bold text-white transition hover:text-forest-100"
            >
              Boka tid
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-forest-300">
            Kontakt
          </p>
          <div className="grid gap-3 text-sm text-forest-50">
            <p className="flex gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              {businessInfo.address}
            </p>
            {businessInfo.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replaceAll(" ", "")}`}
                className="flex gap-2 transition hover:text-white"
              >
                <Phone size={16} className="mt-0.5 shrink-0" />
                {phone}
              </a>
            ))}
            <a
              href={`mailto:${businessInfo.emailAscii}`}
              className="flex gap-2 transition hover:text-white"
            >
              <Mail size={16} className="mt-0.5 shrink-0" />
              {businessInfo.email}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-padded text-xs text-forest-100">
          <p>© {new Date().getFullYear()} {businessInfo.name}. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
}
