import type { BookingRecord } from "@/lib/booking-types";
import {
  bookingExtras,
  formatCurrency,
  getServicePackage,
  getVehicleType
} from "@/lib/pricing";
import { businessInfo } from "@/lib/site";

export async function sendAdminBookingEmail(booking: BookingRecord) {
  const service = getServicePackage(booking.serviceId);
  const vehicleType = getVehicleType(booking.vehicleTypeId);
  const extras = bookingExtras.filter((extra) => booking.extras.includes(extra.id));

  // Future email integration:
  // ADMIN_EMAIL receives booking notifications and EMAIL_FROM is the sender.
  // Replace this mock with your provider of choice, for example Resend, Postmark or SendGrid.
  console.log("Mock admin booking email", {
    to: process.env.ADMIN_EMAIL ?? businessInfo.bookingEmail,
    from: process.env.EMAIL_FROM ?? businessInfo.email,
    subject: `Ny bokning: ${booking.customer.name}`,
    customerName: booking.customer.name,
    phone: booking.customer.phone,
    email: booking.customer.email,
    servicePackage: service?.name ?? booking.serviceId,
    vehicleType: vehicleType?.name ?? booking.vehicleTypeId,
    licensePlate: booking.customer.licensePlate,
    extras: extras.length > 0 ? extras.map((extra) => extra.name) : ["Inga tillval"],
    duration: service?.duration ?? "-",
    finalPrice: formatCurrency(booking.price.total),
    date: booking.date,
    time: booking.time,
    message: booking.customer.message ?? ""
  });
}

export async function sendCustomerConfirmationEmail(booking: BookingRecord) {
  const service = getServicePackage(booking.serviceId);
  const vehicleType = getVehicleType(booking.vehicleTypeId);
  const extras = bookingExtras.filter((extra) => booking.extras.includes(extra.id));

  console.log("Mock customer confirmation email", {
    to: booking.customer.email,
    from: process.env.EMAIL_FROM ?? businessInfo.email,
    subject: `Bokningsbekräftelse från ${businessInfo.name}`,
    confirmation: {
      service: service?.name ?? booking.serviceId,
      date: booking.date,
      time: booking.time,
      vehicleType: vehicleType?.name ?? booking.vehicleTypeId,
      licensePlate: booking.customer.licensePlate,
      extras: extras.length > 0 ? extras.map((extra) => extra.name) : ["Inga tillval"],
      duration: service?.duration ?? "-",
      finalPrice: formatCurrency(booking.price.total),
      contact: {
        phone: businessInfo.phone,
        email: businessInfo.email,
        address: businessInfo.address
      }
    }
  });
}
