import type { BookingRecord, BookingStatus } from "@/lib/booking-types";
import {
  bookingExtras,
  formatCurrency,
  getServicePackage,
  getVehicleType
} from "@/lib/pricing";
import { businessInfo } from "@/lib/business-info";
import { getResend, hasEmailProvider } from "@/lib/resend";
import { loanCars } from "@/lib/loan-cars";
import { getSmtpTransport, hasSmtpProvider } from "@/lib/smtp";

type MailPayload = {
  to: string | string[];
  cc?: string[];
  subject: string;
  html: string;
  text: string;
};

function emailFrom() {
  return (
    process.env.EMAIL_FROM ??
    `${businessInfo.name} <${
      process.env.SMTP_USER ?? "onboarding@resend.dev"
    }>`
  );
}

async function sendMail(payload: MailPayload) {
  if (hasSmtpProvider()) {
    const result = await getSmtpTransport().sendMail({
      from: emailFrom(),
      to: payload.to,
      cc: payload.cc,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: businessInfo.bookingEmailAscii
    });

    return {
      provider: "smtp",
      messageId: result.messageId
    };
  }

  if (hasEmailProvider()) {
    const { data, error } = await getResend().emails.send({
      from: emailFrom(),
      to: payload.to,
      cc: payload.cc,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: businessInfo.bookingEmailAscii
    });

    if (error) {
      console.error("Resend email error", error);
      throw new Error("E-post kunde inte skickas");
    }

    return data;
  }

  if (!hasSmtpProvider() && !hasEmailProvider()) {
    console.log("Email provider missing. Mock email only.", payload);
    return { mocked: true };
  }
}

function bookingRows(booking: BookingRecord) {
  const service = getServicePackage(booking.serviceId);
  const vehicleType = getVehicleType(booking.vehicleTypeId);
  const extras = bookingExtras.filter((extra) => booking.extras.includes(extra.id));

  return {
    service: booking.serviceName ?? service?.name ?? booking.serviceId,
    vehicleType: booking.vehicleTypeName ?? vehicleType?.name ?? booking.vehicleTypeId,
    extras: extras.length > 0 ? extras.map((extra) => extra.name).join(", ") : "Inga tillval",
    duration: booking.duration ?? service?.duration ?? "-",
    finalPrice: formatCurrency(booking.price.total),
    loanCar:
      loanCars.find((car) => car.id === booking.loanCarId)?.name ??
      "Ingen lånebil"
  };
}

function bookingHtml(title: string, intro: string, booking: BookingRecord) {
  const rows = bookingRows(booking);

  return `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <h1>${title}</h1>
      <p>${intro}</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 620px;">
        <tr><td><strong>Kund</strong></td><td>${booking.customer.name}</td></tr>
        <tr><td><strong>Telefon</strong></td><td>${booking.customer.phone}</td></tr>
        <tr><td><strong>E-post</strong></td><td>${booking.customer.email}</td></tr>
        <tr><td><strong>Tjänst</strong></td><td>${rows.service}</td></tr>
        <tr><td><strong>Fordon</strong></td><td>${rows.vehicleType}</td></tr>
        <tr><td><strong>Registreringsnummer</strong></td><td>${booking.customer.licensePlate}</td></tr>
        <tr><td><strong>Tillval</strong></td><td>${rows.extras}</td></tr>
        <tr><td><strong>Varaktighet</strong></td><td>${rows.duration}</td></tr>
        <tr><td><strong>Lånebil</strong></td><td>${rows.loanCar}</td></tr>
        <tr><td><strong>Datum/tid</strong></td><td>${booking.date} kl. ${booking.time}</td></tr>
        <tr><td><strong>Slutpris</strong></td><td>${rows.finalPrice}</td></tr>
      </table>
      ${booking.customer.message ? `<p><strong>Meddelande:</strong> ${booking.customer.message}</p>` : ""}
      <p>${businessInfo.name}<br>${businessInfo.address}<br>${businessInfo.phone}<br>${businessInfo.email}</p>
    </div>
  `;
}

function bookingText(title: string, intro: string, booking: BookingRecord) {
  const rows = bookingRows(booking);

  return `${title}

${intro}

Kund: ${booking.customer.name}
Telefon: ${booking.customer.phone}
E-post: ${booking.customer.email}
Tjänst: ${rows.service}
Fordon: ${rows.vehicleType}
Registreringsnummer: ${booking.customer.licensePlate}
Tillval: ${rows.extras}
Varaktighet: ${rows.duration}
Lånebil: ${rows.loanCar}
Datum/tid: ${booking.date} kl. ${booking.time}
Slutpris: ${rows.finalPrice}
${booking.customer.message ? `Meddelande: ${booking.customer.message}` : ""}

${businessInfo.name}
${businessInfo.address}
${businessInfo.phone}
${businessInfo.email}`;
}

export async function sendAdminBookingEmail(booking: BookingRecord) {
  await sendMail({
    to: process.env.ADMIN_EMAIL ?? businessInfo.bookingEmailAscii,
    cc: [businessInfo.bookingCopyEmail],
    subject: `Ny bokning: ${booking.customer.name}`,
    html: bookingHtml("Ny bokning", "En ny bokning har kommit in.", booking),
    text: bookingText("Ny bokning", "En ny bokning har kommit in.", booking)
  });
}

export async function sendCustomerConfirmationEmail(booking: BookingRecord) {
  await sendMail({
    to: booking.customer.email,
    subject: `Bokningsbekräftelse från ${businessInfo.name}`,
    html: bookingHtml(
      "Bokningsbekräftelse",
      "Tack! Vi har tagit emot din bokning.",
      booking
    ),
    text: bookingText(
      "Bokningsbekräftelse",
      "Tack! Vi har tagit emot din bokning.",
      booking
    )
  });
}

export async function sendCustomerStatusEmail(
  booking: BookingRecord,
  status: BookingStatus
) {
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

  await sendMail({
    to: booking.customer.email,
    subject: statusMessage.subject,
    html: bookingHtml(statusMessage.subject, statusMessage.message, booking),
    text: bookingText(statusMessage.subject, statusMessage.message, booking)
  });
}
