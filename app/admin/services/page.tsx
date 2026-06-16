import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminServicesManager } from "@/components/admin/AdminServicesManager";
import { readServices } from "@/lib/service-store";

export const metadata: Metadata = {
  title: "Admin tjänster"
};

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await readServices();

  return (
    <AdminShell
      title="Tjänster och priser"
      description="Ändringar sparas i lokal JSON och används av hemsida och bokning direkt."
    >
      <AdminServicesManager initialServices={services} />
    </AdminShell>
  );
}
