import { z } from "zod";

export const servicePackageIds = [
  "exterior-wash",
  "interior-cleaning",
  "complete-detail",
  "polishing",
  "paint-protection"
] as const;

export const vehicleTypeIds = ["sedan", "kombi", "suv", "7-sits"] as const;

export const extraIds = ["dog-hair", "dirty-interior"] as const;

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
  status: "confirmed";
};

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
