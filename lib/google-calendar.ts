import type { AvailableSlot, BookingRecord } from "@/lib/booking-types";

const slotTimes = ["08:30", "10:30", "13:00", "15:00"];

function formatSlotDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function weekdayName(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", { weekday: "short" }).format(date);
}

export async function getAvailableSlots(): Promise<AvailableSlot[]> {
  const slots: AvailableSlot[] = [];
  const today = new Date();

  for (let offset = 1; slots.length < 18 && offset < 14; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    const day = date.getDay();
    const isSunday = day === 0;

    if (isSunday) {
      continue;
    }

    const dateString = formatSlotDate(date);

    slotTimes.forEach((time, index) => {
      slots.push({
        id: `${dateString}-${time}`,
        date: dateString,
        time,
        label: `${weekdayName(date)} ${dateString} kl. ${time}`,
        available: !(day === 6 && index > 1)
      });
    });
  }

  return slots.filter((slot) => slot.available);
}

export async function createCalendarEvent(booking: BookingRecord) {
  // Future Google Calendar integration:
  // GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY authenticate a service account.
  // GOOGLE_CALENDAR_ID identifies the business calendar where events are created.
  // Use Google Calendar free/busy before this point to prevent double bookings.
  console.log("Mock calendar event created", {
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    bookingId: booking.id,
    date: booking.date,
    time: booking.time,
    customer: booking.customer.name
  });

  return {
    provider: "mock-google-calendar",
    eventId: `mock-${booking.id}`
  };
}
