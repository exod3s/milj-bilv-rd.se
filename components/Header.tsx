"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/BrandLogo";
import { businessInfo, navItems } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
      <nav className="container-padded flex min-h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setIsOpen(false)}
          aria-label={`${businessInfo.name} startsida`}
        >
          <BrandLogo className="h-14 w-14" />
          <span className="leading-tight">
            <span className="block text-sm font-black text-forest-950">
              {businessInfo.shortName}
            </span>
            <span className="block text-xs font-black text-forest-700">
              i Ö-vik
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-semibold transition",
                pathname === item.href
                  ? "bg-forest-50 text-forest-800"
                  : "text-slate-800 hover:bg-forest-50 hover:text-forest-950"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${businessInfo.phone.replaceAll(" ", "")}`}
            className="text-sm font-black text-forest-950 hover:text-forest-700"
          >
            {businessInfo.phone}
          </a>
          <Link href="/booking" className="button-primary">
            Boka nu
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-forest-100 bg-white text-forest-950 lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "Stäng meny" : "Öppna meny"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-black/10 bg-white lg:hidden">
          <div className="container-padded grid gap-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "rounded-md px-3 py-3 text-sm font-semibold",
                  pathname === item.href
                    ? "bg-forest-50 text-forest-800"
                    : "text-slate-700"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/booking"
              onClick={() => setIsOpen(false)}
              className="button-primary mt-2"
            >
              Boka nu
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
