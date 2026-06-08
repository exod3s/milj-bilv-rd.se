import Link from "next/link";
import { bookingExtras, formatCurrency, servicePackages, vehicleTypes } from "@/lib/pricing";

export function PricingTable() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="surface overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-forest-100 bg-forest-950 px-4 py-4 text-sm font-black text-white sm:px-6">
          <span>Servicepaket</span>
          <span className="text-forest-300">Pris från</span>
        </div>
        <div className="divide-y divide-forest-100">
          {servicePackages.map((service) => (
            <div
              key={service.id}
              className="grid gap-3 px-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"
            >
              <div>
                <p className="font-black text-forest-950">{service.name}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-forest-600">
                  {service.duration}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                <p className="text-xl font-black text-forest-950">
                  {formatCurrency(service.basePrice)}
                </p>
                <Link
                  href={`/booking?service=${service.id}`}
                  className="mt-2 inline-flex rounded-md bg-forest-300 px-3 py-2 text-sm font-black text-forest-950 hover:bg-forest-400"
                >
                  Boka
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="surface border-forest-300 p-5">
          <h3 className="text-lg font-black text-forest-950">
            Fordonstillägg
          </h3>
          <div className="mt-4 grid gap-3">
            {vehicleTypes.map((vehicleType) => (
              <div
                key={vehicleType.id}
                className="flex items-center justify-between border-b border-forest-100 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm font-semibold text-slate-700">
                  {vehicleType.name}
                </span>
                <span className="text-sm font-black text-forest-950">
                  +{formatCurrency(vehicleType.adjustment)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface border-forest-300 p-5">
          <h3 className="text-lg font-black text-forest-950">Tillval</h3>
          <div className="mt-4 grid gap-3">
            {bookingExtras.map((extra) => (
              <div
                key={extra.id}
                className="border-b border-forest-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-700">
                    {extra.name}
                  </span>
                  <span className="text-sm font-black text-forest-950">
                    +{formatCurrency(extra.price)}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {extra.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
