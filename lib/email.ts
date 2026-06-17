import type { BookingRecord, BookingStatus } from "@/lib/booking-types";
import {
  bookingExtras,
  formatCurrency,
  getServicePackage,
  getVehicleType
} from "@/lib/pricing";
import { businessInfo } from "@/lib/business-info";

export async function sendAdminBookingEmail(booking: BookingRecord) {
  const service = getServicePackage(booking.serviceId);
  const vehicleType = getVehicleType(booking.vehicleTypeId);
  const extras = bookingExtras.filter((extra) => booking.extras.includes(extra.id));

  // Future email integration:
  // ADMIN_EMAIL receives booking notifications and EMAIL_FROM is the sender.
  // Replace this mock with your provider of choice, for example Resend, Postmark or SendGrid.
  console.log("Mock admin booking email", {
    to: process.env.ADMIN_EMAIL ?? businessInfo.emailAscii,
    cc: [businessInfo.bookingCopyEmail],
    from: process.env.EMAIL_FROM ?? businessInfo.emailAscii,
    subject: `Ny bokning: ${booking.customer.name}`,
    customerName: booking.customer.name,
    phone: booking.customer.phone,
    email: booking.customer.email,
    servicePackage: booking.serviceName ?? service?.name ?? booking.serviceId,
    vehicleType: booking.vehicleTypeName ?? vehicleType?.name ?? booking.vehicleTypeId,
    licensePlate: booking.customer.licensePlate,
    extras: extras.length > 0 ? extras.map((extra) => extra.name) : ["Inga tillval"],
    duration: booking.duration ?? service?.duration ?? "-",
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
    from: process.env.EMAIL_FROM ?? businessInfo.emailAscii,
    subject: `Bokningsbekräftelse från ${businessInfo.name}`,
    confirmation: {
      service: booking.serviceName ?? service?.name ?? booking.serviceId,
      date: booking.date,
      time: booking.time,
      vehicleType: booking.vehicleTypeName ?? vehicleType?.name ?? booking.vehicleTypeId,
      licensePlate: booking.customer.licensePlate,
      extras: extras.length > 0 ? extras.map((extra) => extra.name) : ["Inga tillval"],
      duration: booking.duration ?? service?.duration ?? "-",
      finalPrice: formatCurrency(booking.price.total),
      contact: {
        phone: businessInfo.phone,
        secondaryPhone: businessInfo.secondaryPhone,
        email: businessInfo.email,
        emailAscii: businessInfo.emailAscii,
        address: businessInfo.address
      }
    }
  });
}

export async function sendCustomerStatusEmail(
  booking: BookingRecord,
  status: BookingStatus
) {
  const service = getServicePackage(booking.serviceId);
  const vehicleType = getVehicleType(booking.vehicleTypeId);
  const statusMessages: Partial<Record<BookingStatus, {
    subject: string;
    message: string;
  }>> = {
    "in-progress": {
      subject: `Din bil är intagen för rengöring hos ${businessInfo.name}`,
      message:
        "Din bil är nu intagen och arbetet har påbörjats. Vi hör av oss när bilen är klar för hämtning."
    },
    completed: {
      subject: `Din bil är klar för hämtning hos ${businessInfo.name}`,
      message:
        "Din bil är färdigbehandlad och klar för hämtning. Tack för att du valde oss."
    },
    confirmed: {
      subject: `Din bokning är bekräftad hos ${businessInfo.name}`,
      message: "Din bokning är bekräftad. Vi ser fram emot att ta hand om bilen."
    },
    cancelled: {
      subject: `Din bokning är avbokad hos ${businessInfo.name}`,
      message:
        "Din bokning är avbokad. Kontakta oss gärna om du vill boka en ny tid."
    }
  };
  const statusMessage = statusMessages[status];

  if (!statusMessage) {
    return;
  }

  console.log("Mock customer status email", {
    to: booking.customer.email,
    from: process.env.EMAIL_FROM ?? businessInfo.emailAscii,
    subject: statusMessage.subject,
    message: statusMessage.message,
    booking: {
      service: booking.serviceName ?? service?.name ?? booking.serviceId,
      date: booking.date,
      time: booking.time,
      vehicleType: booking.vehicleTypeName ?? vehicleType?.name ?? booking.vehicleTypeId,
      licensePlate: booking.customer.licensePlate,
      duration: booking.duration ?? service?.duration ?? "-",
      finalPrice: formatCurrency(booking.price.total),
      contact: {
        phone: businessInfo.phone,
        secondaryPhone: businessInfo.secondaryPhone,
        email: businessInfo.email,
        emailAscii: businessInfo.emailAscii,
        address: businessInfo.address
      }
    }
  });
}
