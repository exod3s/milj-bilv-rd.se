import type {
  ExtraId,
  PriceSummary,
  ServicePackageId,
  VehicleTypeId
} from "@/lib/booking-types";

export const servicePackages = [
  {
    id: "quick-wash",
    name: "Snabbtvätt",
    shortLabel: "Snabb och prisvärd tvätt",
    basePrice: 150,
    duration: "30 min",
    durationMinutes: 30,
    description:
      "En snabb utvändig uppfräschning för dig som vill få bilen ren utan en större behandling.",
    highlights: ["Avspolning", "Skonsam schamponering", "Snabb avtorkning"]
  },
  {
    id: "exterior-wash-polish",
    name: "Utvändig tvätt",
    shortLabel: "Utvändig tvätt med bättre finish",
    basePrice: 399,
    duration: "1 tim",
    durationMinutes: 60,
    description:
      "Skonsam utvändig tvätt med avfettning, fälgrengöring och torkning för en ren och fräsch bil.",
    highlights: ["Avfettning", "Fälgrengöring", "Handtvätt", "Torkning"]
  },
  {
    id: "interior-cleaning",
    name: "Invändig rengöring",
    shortLabel: "Kupé, mattor och paneler",
    basePrice: 699,
    duration: "2 tim",
    durationMinutes: 120,
    description:
      "Noggrann dammsugning, rengöring av paneler, mattor, dörrsidor och invändiga ytor.",
    highlights: ["Dammsugning", "Panelrengöring", "Mattor", "Dörrsidor"]
  },
  {
    id: "complete-detail",
    name: "Komplett rekond",
    shortLabel: "Invändigt och utvändigt",
    basePrice: 1499,
    duration: "3-5 tim",
    durationMinutes: 240,
    description:
      "En helhetsbehandling för bilen med både utvändig och invändig rekond i premiumkänsla.",
    highlights: ["Utvändig tvätt", "Invändig rengöring", "Djuprengöring", "Finishkontroll"]
  },
  {
    id: "deluxe-machine-fix",
    name: "Deluxe med maskinfixning",
    shortLabel: "Kampanjpris",
    basePrice: 1495,
    originalPrice: 3000,
    duration: "4 tim",
    durationMinutes: 240,
    description:
      "Deluxebehandling med maskinfixning för en tydlig glanshöjning och en mer välvårdad helhetskänsla.",
    highlights: ["Deluxetvätt", "Maskinfixning", "Glanshöjning", "Finishkontroll"]
  },
  {
    id: "summer-discount",
    name: "Utvändig tvätt med polish, maskinfix och motortvätt",
    shortLabel: "Sommarrabatt",
    basePrice: 2799,
    originalPrice: 5600,
    duration: "1 dag",
    durationMinutes: 480,
    description:
      "Sommarrabatt på en omfattande utvändig behandling med polish, maskinfix och motortvätt.",
    highlights: ["Utvändig tvätt", "Polish", "Maskinfix", "Motortvätt"]
  },
  {
    id: "polishing",
    name: "Polering",
    shortLabel: "Glans och lättare repor",
    basePrice: 2499,
    duration: "1 dag",
    durationMinutes: 480,
    description:
      "Maskinpolering som lyfter glans, reducerar tvättrepor och ger lacken nytt liv.",
    highlights: ["Maskinpolering", "Glanslyft", "Lackinspektion"]
  },
  {
    id: "paint-protection",
    name: "Lackskydd",
    shortLabel: "Skyddande behandling",
    basePrice: 3499,
    duration: "1 dag",
    durationMinutes: 480,
    description:
      "Skyddande behandling som hjälper lacken hålla glans och gör bilen enklare att tvätta.",
    highlights: ["Långvarigt skydd", "Vattenavrinning", "Premiumfinish"]
  }
] as const satisfies ReadonlyArray<{
  id: ServicePackageId;
  name: string;
  shortLabel: string;
  basePrice: number;
  originalPrice?: number;
  duration: string;
  durationMinutes: number;
  description: string;
  highlights: string[];
}>;

export const vehicleTypes = [
  { id: "sedan", name: "Sedan", adjustment: 0 },
  { id: "kombi", name: "Kombi", adjustment: 0 },
  { id: "suv", name: "SUV", adjustment: 200 },
  { id: "7-sits", name: "7-sits", adjustment: 300 }
] as const satisfies ReadonlyArray<{
  id: VehicleTypeId;
  name: string;
  adjustment: number;
}>;

export const bookingExtras = [
  {
    id: "dog-hair",
    name: "Hundhår",
    price: 200,
    description: "Extra tid för borttagning av hundhår i kupé och bagage."
  }
] as const satisfies ReadonlyArray<{
  id: ExtraId;
  name: string;
  price: number;
  description: string;
}>;

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0
  }).format(amount);
}

export function getServicePackage(id: ServicePackageId) {
  return servicePackages.find((service) => service.id === id);
}

export function getServiceDuration(id: ServicePackageId) {
  const service = getServicePackage(id);
  return service
    ? {
        label: service.duration,
        minutes: service.durationMinutes
      }
    : null;
}

export function getVehicleType(id: VehicleTypeId) {
  return vehicleTypes.find((vehicleType) => vehicleType.id === id);
}

export function getBookingExtra(id: ExtraId) {
  return bookingExtras.find((extra) => extra.id === id);
}

export function calculateBookingPrice(input: {
  serviceId: ServicePackageId;
  vehicleTypeId: VehicleTypeId;
  extras?: ExtraId[];
}): PriceSummary {
  const service = getServicePackage(input.serviceId);
  const vehicleType = getVehicleType(input.vehicleTypeId);

  if (!service) {
    throw new Error("Ogiltigt servicepaket");
  }

  if (!vehicleType) {
    throw new Error("Ogiltig fordonstyp");
  }

  const uniqueExtras = Array.from(new Set(input.extras ?? []));
  const extraLines = uniqueExtras.map((extraId) => {
    const extra = getBookingExtra(extraId);

    if (!extra) {
      throw new Error("Ogiltigt tillval");
    }

    return {
      label: extra.name,
      amount: extra.price,
      type: "extra" as const
    };
  });

  const extrasTotal = extraLines.reduce((sum, line) => sum + line.amount, 0);
  const vehicleAdjustment = vehicleType.adjustment;
  const total = service.basePrice + vehicleAdjustment + extrasTotal;

  return {
    basePrice: service.basePrice,
    vehicleAdjustment,
    extrasTotal,
    total,
    lines: [
      {
        label: service.name,
        amount: service.basePrice,
        type: "base"
      },
      {
        label: `Fordonstyp: ${vehicleType.name}`,
        amount: vehicleAdjustment,
        type: "vehicle"
      },
      ...extraLines
    ]
  };
}
