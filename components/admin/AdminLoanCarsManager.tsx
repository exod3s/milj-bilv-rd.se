"use client";

import { useMemo, useState } from "react";
import { Ban, Car, Loader2, LockOpen } from "lucide-react";
import type { LoanCarId, LoanCarInfo } from "@/lib/booking-types";
import type { LoanCarBlock } from "@/lib/loan-car-store";

type LoanCarReservation = {
  bookingId: string;
  loanCarId: LoanCarId;
  customerName: string;
  registrationNumber: string;
  serviceName: string;
  startAt: string;
  endAt: string;
};

function localDateTimeInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  return value.replace("T", " kl. ");
}

export function AdminLoanCarsManager({
  cars,
  initialBlocks,
  reservations
}: {
  cars: LoanCarInfo[];
  initialBlocks: LoanCarBlock[];
  reservations: LoanCarReservation[];
}) {
  const initialStart = useMemo(() => {
    const date = new Date();
    date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0);
    return localDateTimeInput(date);
  }, []);
  const initialEnd = useMemo(() => {
    const date = new Date();
    date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0);
    date.setHours(date.getHours() + 4);
    return localDateTimeInput(date);
  }, []);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [loanCarId, setLoanCarId] = useState<LoanCarId>("loan-car-1");
  const [startAt, setStartAt] = useState(initialStart);
  const [endAt, setEndAt] = useState(initialEnd);
  const [note, setNote] = useState("Drop-in / utlånad manuellt");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function blockCar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/loan-cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanCarId, startAt, endAt, note })
      });
      const result = (await response.json()) as {
        ok: boolean;
        block?: LoanCarBlock;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.block) {
        throw new Error(result.error ?? "Kunde inte blockera lånebilen");
      }

      setBlocks((current) =>
        [...current, result.block!].sort((a, b) =>
          a.startAt.localeCompare(b.startAt)
        )
      );
      setMessage("Lånebilen är nu blockerad under den valda tiden.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  async function openCar(block: LoanCarBlock) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/loan-cars?id=${encodeURIComponent(block.id)}`,
        { method: "DELETE" }
      );
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Kunde inte öppna lånebilen");
      }

      setBlocks((current) => current.filter((item) => item.id !== block.id));
      setMessage("Den manuella blockeringen är borttagen.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <form onSubmit={blockCar} className="surface h-fit p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-forest-950 text-white">
          <Ban size={22} />
        </div>
        <h2 className="mt-4 text-xl font-black text-forest-950">
          Blockera lånebil manuellt
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Använd detta när en drop-in-kund tar en bil eller när en bil inte ska
          kunna bokas online.
        </p>

        <label className="mt-5 block">
          <span className="field-label">Lånebil</span>
          <select
            className="field-input mt-2"
            value={loanCarId}
            onChange={(event) => setLoanCarId(event.target.value as LoanCarId)}
          >
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="field-label">Från</span>
          <input
            className="field-input mt-2"
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            required
          />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Till</span>
          <input
            className="field-input mt-2"
            type="datetime-local"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            required
          />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Orsak / notering</span>
          <input
            className="field-input mt-2"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        {message ? (
          <p className="mt-4 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-bold text-forest-800">
            {message}
          </p>
        ) : null}

        <button className="button-primary mt-5 w-full" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
          Blockera bilen
        </button>
      </form>

      <div className="grid gap-6">
        <section className="surface p-5">
          <h2 className="text-xl font-black text-forest-950">
            Manuella blockeringar
          </h2>
          <div className="mt-4 grid gap-3">
            {blocks.length === 0 ? (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                Inga lånebilar är manuellt blockerade.
              </p>
            ) : null}
            {blocks.map((block) => {
              const car = cars.find((item) => item.id === block.loanCarId);

              return (
                <article
                  key={block.id}
                  className="flex flex-col gap-4 rounded-md border border-black/10 bg-white p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-black text-forest-950">{car?.name}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDateTime(block.startAt)} - {formatDateTime(block.endAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{block.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCar(block)}
                    disabled={loading}
                    className="button-secondary shrink-0"
                  >
                    <LockOpen size={16} />
                    Öppna bilen igen
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="text-xl font-black text-forest-950">
            Bokade lånebilar
          </h2>
          <div className="mt-4 grid gap-3">
            {reservations.length === 0 ? (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                Inga lånebilar är kopplade till kommande bokningar.
              </p>
            ) : null}
            {reservations.map((reservation) => {
              const car = cars.find(
                (item) => item.id === reservation.loanCarId
              );

              return (
                <article
                  key={reservation.bookingId}
                  className="rounded-md border border-black/10 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-forest-50 text-forest-700">
                      <Car size={20} />
                    </span>
                    <div>
                      <p className="font-black text-forest-950">
                        {car?.name} · {reservation.customerName}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {reservation.registrationNumber} · {reservation.serviceName}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-forest-700">
                        {formatDateTime(reservation.startAt)} -{" "}
                        {formatDateTime(reservation.endAt)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
