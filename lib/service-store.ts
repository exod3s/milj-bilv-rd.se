import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ServicePackage } from "@/lib/pricing";
import { servicePackages } from "@/lib/pricing";

const servicesFile = path.join(process.cwd(), "data", "services.json");
const removedServiceIds = new Set([
  "dackbyte-balansering",
  "balansering",
  "dackomlaggning-balansering"
]);

export async function readServices(): Promise<ServicePackage[]> {
  try {
    const file = await readFile(servicesFile, "utf8");
    const services = JSON.parse(file) as ServicePackage[];
    return services.filter((service) => !removedServiceIds.has(service.id));
  } catch {
    return [...servicePackages];
  }
}

export async function writeServices(services: ServicePackage[]) {
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
