import type {
  ExtraId,
  PriceSummary,
  ServicePackageId,
  VehicleTypeId
} from "@/lib/booking-types";

export const servicePackages = [
  {
    id: "exterior-wash",
    name: "Utvändig tvätt",
    basePrice: 399,
    duration: "45-60 min",
    description:
      "Skonsam handtvätt, avfettning, fälgrengöring och torkning för en ren och fräsch bil.",
    highlights: ["Handtvätt", "Fälgrengöring", "Miljöanpassade produkter"]
  },
  {
    id: "interior-cleaning",
    name: "Invändig rengöring",
    basePrice: 699,
    duration: "1,5-2 tim",
    description:
      "Noggrann dammsugning, rengöring av paneler, mattor, dörrsidor och invändiga ytor.",
    highlights: ["Dammsugning", "Panelrengöring", "Mattor och textil"]
  },
  {
    id: "complete-detail",
    name: "Komplett rekond",
    basePrice: 1499,
    duration: "3-5 tim",
    description:
      "En helhetsbehandling för bilen med både utvändig och invändig rekond i premiumkänsla.",
    highlights: ["Invändigt och utvändigt", "Djuprengöring", "Finishkontroll"]
  },
  {
    id: "polishing",
    name: "Polering",
    basePrice: 2499,
    duration: "1 dag",
    description:
      "Maskinpolering som lyfter glans, reducerar tvättrepor och ger lacken nytt liv.",
    highlights: ["Maskinpolering", "Glanslyft", "Lackinspektion"]
  },
  {
    id: "paint-protection",
    name: "Lackskydd",
    basePrice: 3499,
    duration: "1 dag",
    description:
      "Skyddande behandling som hjälper lacken hålla glans och gör bilen enklare att tvätta.",
    highlights: ["Långvarigt skydd", "Vattenavrinning", "Premiumfinish"]
  }
] as const satisfies ReadonlyArray<{
  id: ServicePackageId;
  name: string;
  basePrice: number;
  duration: string;
  description: string;
  highlights: string[];
}>;

export const vehicleTypes = [
  { id: "sedan", name: "Sedan", adjustment: 0 },
  { id: "kombi", name: "Kombi", adjustment: 100 },
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
  },
  {
    id: "dirty-interior",
    name: "Extra smutsig interiör",
    price: 300,
    description: "För bilar som behöver mer tid för invändig djuprengöring."
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
