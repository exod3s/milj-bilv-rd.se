import type { AvailableSlot, BookingRecord } from "@/lib/booking-types";
import { readBookings } from "@/lib/booking-store";
import { getServiceDuration, getServicePackage } from "@/lib/pricing";

const weekdaySlotTimes = ["08:30", "10:30", "13:00", "15:00"];
const saturdaySlotTimes = ["10:00", "12:00", "14:00", "16:00"];

function formatSlotDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function weekdayName(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", { weekday: "short" }).format(date);
}

export async function getAvailableSlots(
  durationMinutes = 30
): Promise<AvailableSlot[]> {
  const slots: AvailableSlot[] = [];
  const today = new Date();
  const bookings = (await readBookings()).filter(
    (booking) => booking.status !== "cancelled"
  );

  for (let offset = 1; offset <= 31; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    const day = date.getDay();
    if (day === 0) {
      continue;
    }

    const dateString = formatSlotDate(date);
    const isSaturday = day === 6;
    const slotTimes = isSaturday ? saturdaySlotTimes : weekdaySlotTimes;
    const closingHour = isSaturday ? "17:00" : "18:00";

    slotTimes.forEach((time) => {
      const start = new Date(`${dateString}T${time}:00`);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + durationMinutes);
      const closingTime = new Date(`${dateString}T${closingHour}:00`);
      const overlapsBooking = bookings.some((booking) => {
        const bookingStart = new Date(
          `${booking.date}T${booking.time}:00`
        );
        const bookingEnd = new Date(bookingStart);
        bookingEnd.setMinutes(
          bookingEnd.getMinutes() + (booking.durationMinutes ?? 60)
        );
        return start < bookingEnd && bookingStart < end;
      });

      if (end > closingTime || overlapsBooking) {
        return;
      }

      slots.push({
        id: `${dateString}-${time}`,
        date: dateString,
        time,
        label: `${weekdayName(date)} ${dateString} kl. ${time}`,
        available: true
      });
    });
  }

  return slots;
}

export async function createCalendarEvent(booking: BookingRecord) {
  const service = getServicePackage(booking.serviceId);
  const duration = getServiceDuration(booking.serviceId);
  const durationMinutes = booking.durationMinutes ?? duration?.minutes;
  const start = new Date(`${booking.date}T${booking.time}:00`);
  const end = new Date(start);

  if (durationMinutes) {
    end.setMinutes(start.getMinutes() + durationMinutes);
  }

  // Future Google Calendar integration:
  // GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY authenticate a service account.
  // GOOGLE_CALENDAR_ID identifies the business calendar where events are created.
  // Use Google Calendar free/busy before this point to prevent double bookings.
  console.log("Mock calendar event created", {
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    bookingId: booking.id,
    service: booking.serviceName ?? service?.name ?? booking.serviceId,
    date: booking.date,
    time: booking.time,
    durationMinutes,
    start: start.toISOString(),
    end: end.toISOString(),
    customer: booking.customer.name
  });

  return {
    provider: "mock-google-calendar",
    eventId: `mock-${booking.id}`
  };
}
