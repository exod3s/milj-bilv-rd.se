import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { readBookings } from "@/lib/booking-store";
import { formatCurrency } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Admin kunder"
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const bookings = await readBookings();
  const customers = Array.from(
    bookings
      .reduce((map, booking) => {
        const key = booking.customer.email || booking.customer.phone;
        const current = map.get(key) ?? {
          name: booking.customer.name,
          email: booking.customer.email,
          phone: booking.customer.phone,
          plates: new Set<string>(),
          bookings: 0,
          totalSpent: 0,
          history: [] as string[],
          notes: [] as string[]
        };

        current.plates.add(booking.customer.licensePlate);
        current.bookings += 1;
        current.totalSpent += booking.price.total;
        current.history.push(
          `${booking.date} ${booking.time} · ${booking.serviceName ?? booking.serviceId}`
        );
        if (booking.customer.message) {
          current.notes.push(booking.customer.message);
        }
        map.set(key, current);
        return map;
      }, new Map<string, {
        name: string;
        email: string;
        phone: string;
        plates: Set<string>;
        bookings: number;
        totalSpent: number;
        history: string[];
        notes: string[];
      }>())
      .values()
  );

  return (
    <AdminShell
      title="Kunder"
      description="Kundlistan byggs automatiskt från bokningshistoriken."
    >
      <div className="grid gap-5">
        {customers.length === 0 ? (
          <div className="surface p-6 text-slate-600">Inga kunder ännu.</div>
        ) : null}
        {customers.map((customer) => (
          <section key={customer.email || customer.phone} className="surface p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-start">
              <div>
                <h2 className="text-xl font-black text-forest-950">
                  {customer.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">{customer.email}</p>
                <p className="text-sm text-slate-600">{customer.phone}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-forest-700">
                  Registreringsnummer
                </p>
                <p className="mt-2 font-black text-forest-950">
                  {Array.from(customer.plates).join(", ")}
                </p>
              </div>
              <div className="rounded-md bg-polish-mist p-4 text-right">
                <p className="text-sm font-black text-forest-700">
                  {customer.bookings} bokningar
                </p>
                <p className="text-2xl font-black text-forest-950">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="field-label">Bokningshistorik</p>
                <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                  {customer.history.map((item) => (
                    <li key={item} className="rounded-md bg-slate-50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="field-label">Anteckningar</p>
                <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                  {customer.notes.length === 0 ? <li>Inga anteckningar.</li> : null}
                  {customer.notes.map((note) => (
                    <li key={note} className="rounded-md bg-slate-50 px-3 py-2">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
