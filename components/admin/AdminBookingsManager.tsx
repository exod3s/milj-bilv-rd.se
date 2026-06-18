"use client";

import { useState } from "react";
import { bookingStatuses, type BookingRecord, type BookingStatus } from "@/lib/booking-types";
import { formatCurrency } from "@/lib/pricing";
import { loanCars } from "@/lib/loan-cars";

const statusLabels: Record<BookingStatus, string> = {
  new: "Ny",
  confirmed: "Bekräftad",
  "in-progress": "Intagen för rengöring",
  completed: "Klar",
  cancelled: "Avbokad"
};

export function AdminBookingsManager({
  initialBookings
}: {
  initialBookings: BookingRecord[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [message, setMessage] = useState("");

  async function changeStatus(id: string, status: BookingStatus) {
    setMessage("");
    const response = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    const result = (await response.json()) as {
      ok: boolean;
      booking?: BookingRecord;
      error?: string;
    };

    if (!response.ok || !result.ok || !result.booking) {
      setMessage(result.error ?? "Kunde inte uppdatera status");
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === result.booking?.id ? result.booking : booking
      )
    );
    setMessage("Status uppdaterad.");
  }

  return (
    <div className="surface overflow-hidden">
      {message ? (
        <p className="border-b border-black/10 bg-white px-4 py-3 text-sm font-bold text-forest-800">
          {message}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-forest-950 text-white">
            <tr>
              {[
                "Kund",
                "Bil",
                "Tjänst",
                "Tid",
                "Pris",
                "Tillval",
                "Status",
                "Snabbåtgärder"
              ].map((heading) => (
                <th key={heading} className="px-4 py-3 font-black">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 bg-white">
            {bookings.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-slate-600" colSpan={8}>
                  Inga bokningar ännu.
                </td>
              </tr>
            ) : null}
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-4 py-4">
                  <p className="font-black text-forest-950">
                    {booking.customer.name}
                  </p>
                  <p className="text-slate-600">{booking.customer.phone}</p>
                  <p className="text-slate-600">{booking.customer.email}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-black">{booking.customer.licensePlate}</p>
                  <p className="text-slate-600">
                    {booking.vehicleTypeName ?? booking.vehicleTypeId}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-black">
                    {booking.serviceName ?? booking.serviceId}
                  </p>
                  <p className="text-slate-600">
                    {booking.duration ?? `${booking.durationMinutes ?? "-"} min`}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p>{booking.date}</p>
                  <p className="font-black">{booking.time}</p>
                </td>
                <td className="px-4 py-4 font-black">
                  {formatCurrency(booking.price.total)}
                </td>
                <td className="px-4 py-4">
                  <p>
                    {booking.extras.length > 0
                      ? booking.extras.join(", ")
                      : "Inga"}
                  </p>
                  {booking.loanCarId ? (
                    <p className="mt-1 font-black text-forest-700">
                      {loanCars.find((car) => car.id === booking.loanCarId)?.name}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <select
                    className="field-input min-w-40"
                    value={booking.status}
                    onChange={(event) =>
                      changeStatus(booking.id, event.target.value as BookingStatus)
                    }
                  >
                    {bookingStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4">
                  <div className="flex min-w-56 flex-col gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-forest-950 px-3 py-2 text-xs font-black text-white transition hover:bg-forest-800"
                      onClick={() => changeStatus(booking.id, "in-progress")}
                    >
                      Bilen är intagen för rengöring
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-forest-300 px-3 py-2 text-xs font-black text-forest-950 transition hover:bg-forest-400"
                      onClick={() => changeStatus(booking.id, "completed")}
                    >
                      Bilen är klar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
