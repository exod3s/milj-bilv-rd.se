import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ServicePackage } from "@/lib/pricing";
import { servicePackages } from "@/lib/pricing";

const servicesFile = path.join(process.cwd(), "data", "services.json");

export async function readServices(): Promise<ServicePackage[]> {
  try {
    const file = await readFile(servicesFile, "utf8");
    return JSON.parse(file) as ServicePackage[];
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
  const next = services.map((service) =>
    service.id === id ? { ...service, ...patch } : service
  );
  await writeServices(next);
  return next.find((service) => service.id === id);
}
