import type { Metadata } from "next";
import { AdminLoanCarsManager } from "@/components/admin/AdminLoanCarsManager";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getLoanCarReservations,
  readLoanCarBlocks
} from "@/lib/loan-car-store";
import { loanCars } from "@/lib/loan-cars";

export const metadata: Metadata = {
  title: "Admin lånebilar"
};

export const dynamic = "force-dynamic";

export default async function AdminLoanCarsPage() {
  const [blocks, reservations] = await Promise.all([
    readLoanCarBlocks(),
    getLoanCarReservations()
  ]);

  return (
    <AdminShell
      title="Lånebilar"
      description="Se bokade lånebilar och blockera eller öppna de tre bilarna manuellt."
    >
      <AdminLoanCarsManager
        cars={loanCars}
        initialBlocks={blocks}
        reservations={reservations}
      />
    </AdminShell>
  );
}
