import type {
  ExtraId,
  PriceSummary,
  ServicePackageId,
  VehicleTypeId
} from "@/lib/booking-types";

export const serviceCategories = [
  "Biltvättspaket",
  "Rekondpaket",
  "Övriga Behandlingar",
  "Däckverksamhet",
  "Husbil",
  "Presentkort",
  "Rabatter"
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

export type ServicePackage = {
  id: ServicePackageId;
  category: ServiceCategory;
  name: string;
  shortLabel: string;
  basePrice: number;
  originalPrice?: number;
  duration: string;
  durationMinutes: number;
  description: string;
  highlights: string[];
  image?: string;
  bookable: boolean;
  isCampaign?: boolean;
  isGiftCard?: boolean;
  vehicleAdjustments?: Partial<Record<VehicleTypeId, number | null>>;
};

export const defaultVehicleAdjustments: Record<VehicleTypeId, number> = {
  sedan: 0,
  kombi: 0,
  suv: 200,
  "7-sits": 300
};

const biltvattVehicleAdjustments: Record<VehicleTypeId, number> = {
  sedan: 0,
  kombi: 0,
  suv: 200,
  "7-sits": 300
};

export const serviceFallbackImages: Record<string, string> = {
  snabbtvatt:
    "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=85",
  "utvandig-handtvatt":
    "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=900&q=85",
  "invandig-handtvatt":
    "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=900&q=85",
  "deluxe-tvatt":
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85",
  "deluxe-maskinvaxning":
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85",
  "deluxe-motortvatt-invandig":
    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=85",
  "bronz-1":
    "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=85",
  "bronz-2":
    "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=85",
  silver:
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=85",
  guld:
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=85",
  platinum:
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=85",
  diamant:
    "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=900&q=85",
  glasbehandling:
    "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=900&q=85",
  motortvatt:
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85",
  satesrengoring:
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=85",
  lyktpolering:
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=85",
  "husbil-ut-tvatt":
    "https://images.unsplash.com/photo-1545153996-5f6b899064bd?auto=format&fit=crop&w=900&q=85",
  "husbil-deluxe":
    "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=900&q=85",
  "husbil-polera":
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=85",
  dackbyte:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85",
  dackhotell:
    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=85",
  "summer-discount":
    "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=85",
  "deluxe-kort":
    "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=85",
  "deluxe-maskinvaxning-kort":
    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=85",
  "bronz-kort-1":
    "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=85",
  "silver-kort":
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=85"
};

export const servicePackages = [
  {
    id: "snabbtvatt",
    category: "Biltvättspaket",
    name: "Snabbtvätt",
    shortLabel: "Snabb utvändig tvätt",
    basePrice: 150,
    duration: "30 min",
    durationMinutes: 30,
    description: "En snabb och prisvärd tvätt för bilen när du vill fräscha upp utsidan.",
    highlights: ["Avspolning", "Schamponering", "Snabb avtorkning"],
    bookable: true,
    vehicleAdjustments: biltvattVehicleAdjustments
  },
  {
    id: "utvandig-handtvatt",
    category: "Biltvättspaket",
    name: "Utvändig handtvätt",
    shortLabel: "Noggrann handtvätt",
    basePrice: 350,
    duration: "1h",
    durationMinutes: 60,
    description: "Skonsam utvändig handtvätt med fokus på ren lack, fälgar och detaljer.",
    highlights: ["Avfettning", "Handtvätt", "Fälgrengöring", "Torkning"],
    bookable: true,
    vehicleAdjustments: biltvattVehicleAdjustments
  },
  {
    id: "invandig-handtvatt",
    category: "Biltvättspaket",
    name: "Invändig handtvätt",
    shortLabel: "Kupé och interiör",
    basePrice: 500,
    duration: "2h",
    durationMinutes: 120,
    description: "Invändig rengöring med dammsugning, avtorkning och fräschare kupé.",
    highlights: ["Dammsugning", "Paneler", "Mattor", "Dörrsidor"],
    bookable: true,
    vehicleAdjustments: biltvattVehicleAdjustments
  },
  {
    id: "deluxe-tvatt",
    category: "Biltvättspaket",
    name: "Deluxe (in & utvändig tvätt)",
    shortLabel: "In- och utvändig tvätt",
    basePrice: 800,
    duration: "2h",
    durationMinutes: 120,
    description: "Deluxepaket med både invändig och utvändig rengöring.",
    highlights: ["Utvändig handtvätt", "Invändig rengöring", "Fälgar", "Finishkontroll"],
    bookable: true,
    vehicleAdjustments: biltvattVehicleAdjustments
  },
  {
    id: "deluxe-maskinvaxning",
    category: "Biltvättspaket",
    name: "Deluxe + maskinvaxning",
    shortLabel: "Kampanjpaket",
    basePrice: 1495,
    originalPrice: 3000,
    duration: "4h",
    durationMinutes: 240,
    description: "Invändig och utvändig rengöring samt maskinvaxning.",
    highlights: ["Invändig rengöring", "Utvändig handtvätt", "Maskinvaxning", "Glansfinish"],
    bookable: true,
    isCampaign: true,
    vehicleAdjustments: biltvattVehicleAdjustments
  },
  {
    id: "deluxe-motortvatt-invandig",
    category: "Biltvättspaket",
    name: "Deluxe + motortvätt + invändig luktsanering",
    shortLabel: "Deluxe med motortvätt och luktsanering",
    basePrice: 1500,
    duration: "3h",
    durationMinutes: 180,
    description: "Deluxe-paket med motortvätt och invändig luktsanering för en mer komplett behandling.",
    highlights: ["Motortvätt", "Invändig luktsanering", "Utvändig handtvätt", "Kontroll"],
    bookable: true,
    vehicleAdjustments: biltvattVehicleAdjustments
  },
  {
    id: "bronz-1",
    category: "Rekondpaket",
    name: "Bronz 1",
    shortLabel: "Rekond basnivå",
    basePrice: 3200,
    duration: "4h",
    durationMinutes: 240,
    description: "Placeholder: rekondpaket med noggrann rengöring och grundlig finish.",
    highlights: ["Tvätt", "Interiör", "Lättare rekond", "Finish"],
    bookable: true
  },
  {
    id: "bronz-2",
    category: "Rekondpaket",
    name: "Bronz 2",
    shortLabel: "Rekond basnivå",
    basePrice: 2500,
    duration: "4h",
    durationMinutes: 240,
    description: "Placeholder: alternativt bronzpaket med anpassad rekond och finish.",
    highlights: ["Tvätt", "Rekond", "Detaljer", "Finish"],
    bookable: true
  },
  {
    id: "silver",
    category: "Rekondpaket",
    name: "Silver",
    shortLabel: "Utökad rekond",
    basePrice: 4400,
    duration: "5h",
    durationMinutes: 300,
    description: "Placeholder: utökad rekond för bil som behöver mer omsorg och glans.",
    highlights: ["Djuprengöring", "Polish", "Interiör", "Finish"],
    bookable: true
  },
  {
    id: "guld",
    category: "Rekondpaket",
    name: "Guld",
    shortLabel: "Premium rekond",
    basePrice: 5500,
    duration: "5h",
    durationMinutes: 300,
    description: "Placeholder: premium rekond med mer omfattande behandling invändigt och utvändigt.",
    highlights: ["Premiumtvätt", "Polering", "Interiör", "Skydd"],
    bookable: true
  },
  {
    id: "platinum",
    category: "Rekondpaket",
    name: "Platinum",
    shortLabel: "Avancerad rekond",
    basePrice: 6400,
    duration: "5h",
    durationMinutes: 300,
    description: "Placeholder: avancerat rekondpaket med hög finish och tydlig premiumkänsla.",
    highlights: ["Avancerad rekond", "Glans", "Detaljarbete", "Skydd"],
    bookable: true
  },
  {
    id: "diamant",
    category: "Rekondpaket",
    name: "Diamant",
    shortLabel: "Toppaket rekond",
    basePrice: 8700,
    duration: "6h",
    durationMinutes: 360,
    description: "Placeholder: toppaket för maximal rekond, finish och helhetskänsla.",
    highlights: ["Maximal rekond", "Polering", "Skydd", "Slutkontroll"],
    bookable: true
  },
  {
    id: "glasbehandling",
    category: "Övriga Behandlingar",
    name: "Glasbehandling",
    shortLabel: "Sikt och skydd",
    basePrice: 300,
    duration: "30 min",
    durationMinutes: 30,
    description: "Glasbehandling som hjälper vatten att rinna av och förbättrar sikten.",
    highlights: ["Vindruta", "Vattenavrinning", "Snabb behandling"],
    bookable: true
  },
  {
    id: "motortvatt",
    category: "Övriga Behandlingar",
    name: "Motortvätt",
    shortLabel: "Rengöring av motorrum",
    basePrice: 400,
    duration: "30 min",
    durationMinutes: 30,
    description: "Skonsam motortvätt för ett renare och mer välvårdat motorrum.",
    highlights: ["Motorrum", "Skonsam rengöring", "Kontroll"],
    bookable: true
  },
  {
    id: "satesrengoring",
    category: "Övriga Behandlingar",
    name: "Sätesrengöring",
    shortLabel: "Textil och säten",
    basePrice: 1000,
    duration: "1h",
    durationMinutes: 60,
    description: "Rengöring av säten för en fräschare interiör.",
    highlights: ["Säten", "Textil", "Fläckar", "Fräschare kupé"],
    bookable: true
  },
  {
    id: "lyktpolering",
    category: "Övriga Behandlingar",
    name: "Lyktpolering",
    shortLabel: "Klarare lyktor",
    basePrice: 800,
    duration: "1h",
    durationMinutes: 60,
    description: "Polering av matta lyktor för bättre utseende och ljusbild.",
    highlights: ["Framlyktor", "Polering", "Klarare yta"],
    bookable: true
  },
  {
    id: "husbil-ut-tvatt",
    category: "Husbil",
    name: "UT Tvätt (Husbil)",
    shortLabel: "Utvändig husbilstvätt",
    basePrice: 1500,
    duration: "2h",
    durationMinutes: 120,
    description: "Utvändig tvätt anpassad för husbil.",
    highlights: ["Husbil", "Utvändig tvätt", "Skonsam rengöring"],
    bookable: true
  },
  {
    id: "husbil-deluxe",
    category: "Husbil",
    name: "Deluxe Packet (Husbil)",
    shortLabel: "Husbil deluxe",
    basePrice: 1999,
    duration: "3h",
    durationMinutes: 180,
    description: "Deluxepaket för husbil med mer omfattande rengöring.",
    highlights: ["Husbil", "Deluxe", "Utvändig rengöring", "Finish"],
    bookable: true
  },
  {
    id: "husbil-polera",
    category: "Husbil",
    name: "Polera (Husbil)",
    shortLabel: "Polering husbil",
    basePrice: 8000,
    duration: "6h",
    durationMinutes: 360,
    description: "Polering av husbil för bättre glans och skyddskänsla.",
    highlights: ["Husbil", "Polering", "Glans", "Finish"],
    bookable: true
  },
  {
    id: "dackbyte",
    category: "Däckverksamhet",
    name: "Däckbyte",
    shortLabel: "Hjulskifte",
    basePrice: 300,
    duration: "30 min",
    durationMinutes: 30,
    description: "Däckbyte/hjulskifte inför säsong.",
    highlights: ["Däckbyte", "30 minuter", "Säsongsskifte"],
    bookable: true
  },
  {
    id: "dackhotell",
    category: "Däckverksamhet",
    name: "Däckhotell",
    shortLabel: "Förvaring",
    basePrice: 750,
    duration: "30 min",
    durationMinutes: 30,
    description: "Däckhotell för trygg och smidig förvaring.",
    highlights: ["Förvaring", "Kontroll", "Enkelt byte"],
    bookable: true
  },
  {
    id: "summer-discount",
    category: "Rabatter",
    name: "Utvändig tvätt med polish, maskinfix och motortvätt",
    shortLabel: "Sommarrabatt",
    basePrice: 2799,
    originalPrice: 5600,
    duration: "1 dag",
    durationMinutes: 480,
    description: "Sommarrabatt på utvändig tvätt med polish, maskinfix och motortvätt.",
    highlights: ["Utvändig tvätt", "Polish", "Maskinfix", "Motortvätt"],
    bookable: true,
    isCampaign: true,
    vehicleAdjustments: {
      sedan: 0,
      kombi: 0,
      suv: null,
      "7-sits": null
    }
  },
  {
    id: "deluxe-kort",
    category: "Presentkort",
    name: "Deluxe Kort",
    shortLabel: "Presentkort",
    basePrice: 800,
    duration: "Presentkort",
    durationMinutes: 0,
    description: "Presentkort för Deluxe-behandling. Kontakta oss för köp.",
    highlights: ["Presentkort", "Perfekt gåva", "Kontakta oss"],
    bookable: false,
    isGiftCard: true
  },
  {
    id: "deluxe-maskinvaxning-kort",
    category: "Presentkort",
    name: "Deluxe & Maskinvaxning Kort",
    shortLabel: "Presentkort",
    basePrice: 1495,
    duration: "Presentkort",
    durationMinutes: 0,
    description: "Presentkort för Deluxe & maskinvaxning. Kontakta oss för köp.",
    highlights: ["Presentkort", "Kampanjpaket", "Kontakta oss"],
    bookable: false,
    isGiftCard: true
  },
  {
    id: "bronz-kort-1",
    category: "Presentkort",
    name: "Bronz Kort 1",
    shortLabel: "Presentkort",
    basePrice: 3200,
    duration: "Presentkort",
    durationMinutes: 0,
    description: "Presentkort för Bronz 1. Kontakta oss för köp.",
    highlights: ["Presentkort", "Rekond", "Kontakta oss"],
    bookable: false,
    isGiftCard: true
  },
  {
    id: "silver-kort",
    category: "Presentkort",
    name: "Silver Kort",
    shortLabel: "Presentkort",
    basePrice: 4400,
    duration: "Presentkort",
    durationMinutes: 0,
    description: "Presentkort för Silver-paket. Kontakta oss för köp.",
    highlights: ["Presentkort", "Silverpaket", "Kontakta oss"],
    bookable: false,
    isGiftCard: true
  }
] as const satisfies ReadonlyArray<ServicePackage>;

export const benefits = [
  {
    name: "Fri lånebil",
    description: "Fri lånebil finns som tillgänglig förmån. Fråga vid bokning."
  }
] as const;

export const vehicleTypes = [
  { id: "sedan", name: "Sedan", adjustment: defaultVehicleAdjustments.sedan },
  { id: "kombi", name: "Kombi", adjustment: defaultVehicleAdjustments.kombi },
  { id: "suv", name: "SUV", adjustment: defaultVehicleAdjustments.suv },
  { id: "7-sits", name: "7-sits", adjustment: defaultVehicleAdjustments["7-sits"] }
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

export function getBookableServices() {
  return servicePackages.filter((service) => service.bookable);
}

export function getServicesByCategory(category: ServiceCategory) {
  return servicePackages.filter((service) => service.category === category);
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

export function getVehicleAdjustment(
  serviceId: ServicePackageId,
  vehicleTypeId: VehicleTypeId
) {
  const service = getServicePackage(serviceId) as ServicePackage | undefined;

  if (service?.vehicleAdjustments && vehicleTypeId in service.vehicleAdjustments) {
    return service.vehicleAdjustments[vehicleTypeId] ?? null;
  }

  return defaultVehicleAdjustments[vehicleTypeId];
}

export function calculateBookingPrice(input: {
  serviceId: ServicePackageId;
  vehicleTypeId: VehicleTypeId;
  extras?: ExtraId[];
}): PriceSummary {
  return calculateBookingPriceFromCatalog(servicePackages, input);
}

export function calculateBookingPriceFromCatalog(
  services: readonly ServicePackage[],
  input: {
    serviceId: ServicePackageId;
    vehicleTypeId: VehicleTypeId;
    extras?: ExtraId[];
  }
): PriceSummary {
  const service = services.find((item) => item.id === input.serviceId);
  const vehicleType = getVehicleType(input.vehicleTypeId);

  if (!service || !service.bookable) {
    throw new Error("Ogiltigt eller ej bokningsbart servicepaket");
  }

  if (!vehicleType) {
    throw new Error("Ogiltig fordonstyp");
  }

  const vehicleAdjustment =
    service.vehicleAdjustments && input.vehicleTypeId in service.vehicleAdjustments
      ? service.vehicleAdjustments[input.vehicleTypeId] ?? null
      : defaultVehicleAdjustments[input.vehicleTypeId];

  if (vehicleAdjustment === null) {
    throw new Error(
      "Detta erbjudande gäller endast sedan och kombi. För SUV och 7-sits, kontakta oss för pris."
    );
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
