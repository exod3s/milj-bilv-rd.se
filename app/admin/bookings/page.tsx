import type { Metadata } from "next";
import { AdminBookingsManager } from "@/components/admin/AdminBookingsManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { readBookings } from "@/lib/booking-store";

export const metadata: Metadata = {
  title: "Admin bokningar"
};

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = (await readBookings()).sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );

  return (
    <AdminShell
      title="Bokningar"
      description="Se bokningar, kunduppgifter, registreringsnummer och ändra status."
    >
      <AdminBookingsManager initialBookings={bookings} />
    </AdminShell>
  );
}
