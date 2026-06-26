import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureDatabaseSchema, getSql, hasDatabase } from "@/lib/db";
import type { ServicePackage } from "@/lib/pricing";
import { defaultVehicleAdjustments, servicePackages } from "@/lib/pricing";

const servicesFile = path.join(process.cwd(), "data", "services.json");
const removedServiceIds = new Set([
  "dackbyte-balansering",
  "balansering",
  "dackomlaggning-balansering"
]);

function normalizeService(service: ServicePackage): ServicePackage {
  if (service.category !== "Biltvättspaket" || !service.vehicleAdjustments) {
    return service;
  }

  return {
    ...service,
    vehicleAdjustments: {
      ...service.vehicleAdjustments,
      suv: defaultVehicleAdjustments.suv,
      "7-sits": defaultVehicleAdjustments["7-sits"]
    }
  };
}

export async function readServices(): Promise<ServicePackage[]> {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT data
      FROM services
      ORDER BY COALESCE((data->>'category'), ''), COALESCE((data->>'name'), '')
    ` as { data: ServicePackage }[];

    if (rows.length === 0) {
      await writeServices([...servicePackages]);
      return [...servicePackages];
    }

    return rows
      .map((row) => normalizeService(row.data))
      .filter((service) => !removedServiceIds.has(service.id));
  }

  try {
    const file = await readFile(servicesFile, "utf8");
    const services = JSON.parse(file) as ServicePackage[];
    return services
      .map((service) => normalizeService(service))
      .filter((service) => !removedServiceIds.has(service.id));
  } catch {
    return servicePackages.map((service) => normalizeService(service));
  }
}

export async function writeServices(services: ServicePackage[]) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const cleanServices = services.filter(
      (service) => !removedServiceIds.has(service.id)
    );

    await sql`DELETE FROM services`;

    for (const service of cleanServices) {
      await sql`
        INSERT INTO services (id, data, updated_at)
        VALUES (${service.id}, ${JSON.stringify(service)}::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }

    return;
  }

  await mkdir(path.dirname(servicesFile), { recursive: true });
  await writeFile(servicesFile, JSON.stringify(services, null, 2), "utf8");
}

export async function updateService(
  id: string,
  patch: Partial<ServicePackage>
) {
  const services = await readServices();
  const existing = services.find((service) => service.id === id);

  if (!existing) {
    throw new Error("Tjänsten hittades inte");
  }

  const next = services.map((service) =>
    service.id === id ? { ...service, ...patch } : service
  );
  await writeServices(next);
  return next.find((service) => service.id === id);
}

export async function addService(service: ServicePackage) {
  const services = await readServices();

  if (services.some((item) => item.id === service.id)) {
    throw new Error("Det finns redan en tjänst med samma ID");
  }

  const next = [...services, service];
  await writeServices(next);
  return service;
}

export async function deleteService(id: string) {
  const services = await readServices();
  const next = services.filter((service) => service.id !== id);

  if (next.length === services.length) {
    throw new Error("Tjänsten hittades inte");
  }

  await writeServices(next);
  return { id };
}
