import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { readBookings } from "@/lib/booking-store";
import { formatCurrency } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Admin översikt"
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const bookings = await readBookings();
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const todaysBookings = bookings.filter((booking) => booking.date === today);
  const upcomingBookings = bookings.filter(
    (booking) => booking.date >= today && booking.status !== "cancelled"
  );
  const monthlyRevenue = bookings
    .filter(
      (booking) =>
        booking.date.startsWith(month) &&
        booking.status !== "cancelled"
    )
    .reduce((sum, booking) => sum + booking.price.total, 0);
  const serviceCounts = bookings.reduce<Record<string, number>>((counts, booking) => {
    const service = booking.serviceName ?? booking.serviceId;
    counts[service] = (counts[service] ?? 0) + 1;
    return counts;
  }, {});
  const mostBookedService =
    Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  const recentCustomers = bookings.slice(-5).reverse();

  return (
    <AdminShell
      title="Dashboard"
      description="Snabb översikt över bokningar, intäkter och senaste kunder."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Bokningar idag", todaysBookings.length],
          ["Kommande bokningar", upcomingBookings.length],
          ["Månadsintäkt", formatCurrency(monthlyRevenue)],
          ["Mest bokad tjänst", mostBookedService]
        ].map(([label, value]) => (
          <div key={label} className="surface p-5">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-forest-700">
              {label}
            </p>
            <p className="mt-3 text-3xl font-black text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="surface p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-forest-950">
              Senaste kunder
            </h2>
            <Link href="/admin/customers" className="text-sm font-black text-forest-700">
              Visa alla
            </Link>
          </div>
          <div className="grid gap-3">
            {recentCustomers.length === 0 ? (
              <p className="text-sm text-slate-600">Inga kunder ännu.</p>
            ) : null}
            {recentCustomers.map((booking) => (
              <div
                key={booking.id}
                className="rounded-md border border-black/10 bg-slate-50 p-4"
              >
                <p className="font-black text-forest-950">
                  {booking.customer.name}
                </p>
                <p className="text-sm text-slate-600">
                  {booking.customer.phone} · {booking.customer.licensePlate}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="text-xl font-black text-forest-950">
            Pending price requests
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            SUV/7-sits för kampanjer och upphämtning/lämning hanteras som manuella
            prisförfrågningar i denna MVP.
          </p>
          <div className="mt-4 rounded-md bg-polish-mist p-4 text-2xl font-black text-forest-950">
            {bookings.filter((booking) => booking.pickupDropoff).length}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
