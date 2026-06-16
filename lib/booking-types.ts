import { z } from "zod";

export const servicePackageIds = [
  "snabbtvatt",
  "utvandig-handtvatt",
  "invandig-handtvatt",
  "deluxe-tvatt",
  "deluxe-maskinvaxning",
  "deluxe-motortvatt-invandig",
  "bronz-1",
  "bronz-2",
  "silver",
  "guld",
  "platinum",
  "diamant",
  "glasbehandling",
  "motortvatt",
  "satesrengoring",
  "lyktpolering",
  "husbil-ut-tvatt",
  "husbil-deluxe",
  "husbil-polera",
  "dackbyte",
  "dackhotell",
  "dackbyte-balansering",
  "balansering",
  "dackomlaggning-balansering",
  "summer-discount",
  "deluxe-kort",
  "deluxe-maskinvaxning-kort",
  "bronz-kort-1",
  "silver-kort"
] as const;

export const vehicleTypeIds = ["sedan", "kombi", "suv", "7-sits"] as const;

export const extraIds = ["dog-hair"] as const;

export type ServicePackageId = (typeof servicePackageIds)[number];
export type VehicleTypeId = (typeof vehicleTypeIds)[number];
export type ExtraId = (typeof extraIds)[number];

export type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
  licensePlate: string;
  vehicleInfo?: VehicleRegistrationInfo;
  message?: string;
};

export type BookingRequest = {
  serviceId: ServicePackageId;
  vehicleTypeId: VehicleTypeId;
  extras: ExtraId[];
  pickupDropoff: boolean;
  customer: CustomerDetails;
  date: string;
  time: string;
};

export type BookingRecord = BookingRequest & {
  id: string;
  createdAt: string;
  price: PriceSummary;
  status: BookingStatus;
  serviceName?: string;
  vehicleTypeName?: string;
  duration?: string;
  durationMinutes?: number;
};

export type BookingStatus =
  | "new"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";

export const bookingStatuses = [
  "new",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled"
] as const satisfies readonly BookingStatus[];

export type AvailableSlot = {
  id: string;
  date: string;
  time: string;
  label: string;
  available: boolean;
};

export type PriceLine = {
  label: string;
  amount: number;
  type: "base" | "vehicle" | "extra";
};

export type PriceSummary = {
  basePrice: number;
  vehicleAdjustment: number;
  extrasTotal: number;
  total: number;
  lines: PriceLine[];
};

export type VehicleRegistrationInfo = {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  fuelType: string;
  bodyType: string;
  suggestedVehicleTypeId: VehicleTypeId;
  source: "mock" | "external";
};

export const bookingRequestSchema = z.object({
  serviceId: z.enum(servicePackageIds),
  vehicleTypeId: z.enum(vehicleTypeIds),
  extras: z.array(z.enum(extraIds)).default([]),
  pickupDropoff: z.boolean().default(false),
  customer: z.object({
    name: z.string().trim().min(2, "Namn krävs"),
    email: z.string().trim().email("Ange en giltig e-postadress"),
    phone: z.string().trim().min(6, "Telefonnummer krävs"),
    licensePlate: z
      .string()
      .trim()
      .min(2, "Registreringsnummer krävs")
      .transform((value) => value.toUpperCase()),
    vehicleInfo: z
      .object({
        licensePlate: z.string(),
        make: z.string(),
        model: z.string(),
        year: z.number(),
        color: z.string(),
        fuelType: z.string(),
        bodyType: z.string(),
        suggestedVehicleTypeId: z.enum(vehicleTypeIds),
        source: z.enum(["mock", "external"])
      })
      .optional(),
    message: z.string().trim().optional()
  }),
  date: z.string().trim().min(8, "Datum krävs"),
  time: z.string().trim().min(4, "Tid krävs")
});
