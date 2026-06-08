import type {
  VehicleRegistrationInfo,
  VehicleTypeId
} from "@/lib/booking-types";

const mockVehicles: Record<string, Omit<VehicleRegistrationInfo, "source">> = {
  ABC123: {
    licensePlate: "ABC123",
    make: "Volvo",
    model: "V60",
    year: 2021,
    color: "Svart",
    fuelType: "Diesel",
    bodyType: "Kombi",
    suggestedVehicleTypeId: "kombi"
  },
  DEF456: {
    licensePlate: "DEF456",
    make: "Tesla",
    model: "Model Y",
    year: 2023,
    color: "Vit",
    fuelType: "El",
    bodyType: "SUV",
    suggestedVehicleTypeId: "suv"
  },
  GHI789: {
    licensePlate: "GHI789",
    make: "Volkswagen",
    model: "Golf",
    year: 2020,
    color: "Grå",
    fuelType: "Bensin",
    bodyType: "Halvkombi",
    suggestedVehicleTypeId: "sedan"
  },
  SUV777: {
    licensePlate: "SUV777",
    make: "BMW",
    model: "X5",
    year: 2022,
    color: "Mörkblå",
    fuelType: "Laddhybrid",
    bodyType: "SUV",
    suggestedVehicleTypeId: "suv"
  },
  FAM700: {
    licensePlate: "FAM700",
    make: "Mercedes-Benz",
    model: "V-Klass",
    year: 2019,
    color: "Silver",
    fuelType: "Diesel",
    bodyType: "Minibuss",
    suggestedVehicleTypeId: "7-sits"
  }
};

export function normalizeLicensePlate(plate: string) {
  return plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export async function lookupVehicleByRegistrationNumber(
  licensePlate: string
): Promise<VehicleRegistrationInfo | null> {
  const normalizedPlate = normalizeLicensePlate(licensePlate);

  if (normalizedPlate.length < 2) {
    return null;
  }

  // Future real integration:
  // Replace the mock lookup with a vehicle data provider request.
  // Keep provider credentials in env vars, for example VEHICLE_LOOKUP_API_URL
  // and VEHICLE_LOOKUP_API_KEY. Some Swedish vehicle information requires a
  // licensed/commercial data source, so avoid exposing provider keys in client code.
  const mockVehicle = mockVehicles[normalizedPlate];

  if (mockVehicle) {
    return {
      ...mockVehicle,
      source: "mock"
    };
  }

  return inferMockVehicle(normalizedPlate);
}

function inferMockVehicle(
  normalizedPlate: string
): VehicleRegistrationInfo | null {
  if (normalizedPlate.length < 5) {
    return null;
  }

  const lastDigit = Number(normalizedPlate.match(/\d/g)?.at(-1) ?? "0");
  const inferredType: VehicleTypeId =
    lastDigit >= 7 ? "suv" : lastDigit >= 4 ? "kombi" : "sedan";

  const inferredByType = {
    sedan: {
      make: "Toyota",
      model: "Corolla",
      bodyType: "Sedan"
    },
    kombi: {
      make: "Volvo",
      model: "V90",
      bodyType: "Kombi"
    },
    suv: {
      make: "Audi",
      model: "Q5",
      bodyType: "SUV"
    },
    "7-sits": {
      make: "Volkswagen",
      model: "Multivan",
      bodyType: "7-sits"
    }
  } satisfies Record<VehicleTypeId, { make: string; model: string; bodyType: string }>;

  const inferred = inferredByType[inferredType];

  return {
    licensePlate: normalizedPlate,
    make: inferred.make,
    model: inferred.model,
    year: 2021,
    color: "Ej bekräftad",
    fuelType: "Ej bekräftad",
    bodyType: inferred.bodyType,
    suggestedVehicleTypeId: inferredType,
    source: "mock"
  };
}
