import Link from "next/link";
import { LogOut } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/services", label: "Tjänster" },
  { href: "/admin/bookings", label: "Bokningar" },
  { href: "/admin/customers", label: "Kunder" },
  { href: "/admin/gallery", label: "Galleri" }
];

export function AdminShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="border-b border-black/10 bg-forest-950 text-white">
        <div className="container-padded flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-forest-300">
              Admin
            </p>
            <h1 className="text-2xl font-black">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-white/70">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md bg-white/10 px-3 py-2 text-sm font-black text-white transition hover:bg-forest-300 hover:text-forest-950"
              >
                {link.label}
              </Link>
            ))}
            <form action="/api/admin/logout" method="post">
              <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-forest-950">
                <LogOut size={16} />
                Logga ut
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="container-padded py-8">{children}</div>
    </main>
  );
}
