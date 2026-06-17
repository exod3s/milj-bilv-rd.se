"use client";

import { useState } from "react";
import { Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import {
  defaultVehicleAdjustments,
  serviceCategories,
  type ServiceCategory,
  type ServicePackage
} from "@/lib/pricing";
import type { VehicleTypeId } from "@/lib/booking-types";

type Draft = ServicePackage & {
  highlightsText: string;
  vehicleAdjustmentsDraft: Record<VehicleTypeId, string>;
  vehicleContactPrice: Record<VehicleTypeId, boolean>;
};

const vehicleTypeIds: VehicleTypeId[] = ["sedan", "kombi", "suv", "7-sits"];
const vehicleTypeLabels: Record<VehicleTypeId, string> = {
  sedan: "Sedan",
  kombi: "Kombi",
  suv: "SUV",
  "7-sits": "7-sits"
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDraft(service: ServicePackage): Draft {
  return {
    ...service,
    highlightsText: service.highlights.join(", "),
    vehicleAdjustmentsDraft: vehicleTypeIds.reduce(
      (draft, id) => ({
        ...draft,
        [id]: String(
          service.vehicleAdjustments?.[id] ??
            defaultVehicleAdjustments[id]
        )
      }),
      {} as Record<VehicleTypeId, string>
    ),
    vehicleContactPrice: vehicleTypeIds.reduce(
      (draft, id) => ({
        ...draft,
        [id]: service.vehicleAdjustments?.[id] === null
      }),
      {} as Record<VehicleTypeId, boolean>
    )
  };
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error("Servern svarade utan data. Logga in igen och försök på nytt.");
  }

  return JSON.parse(text) as T;
}

function vehicleAdjustmentsFromDraft(service: Draft) {
  return vehicleTypeIds.reduce(
    (rules, id) => ({
      ...rules,
      [id]: service.vehicleContactPrice[id]
        ? null
        : Number(service.vehicleAdjustmentsDraft[id] || 0)
    }),
    {} as ServicePackage["vehicleAdjustments"]
  );
}

export function AdminServicesManager({
  initialServices
}: {
  initialServices: ServicePackage[];
}) {
  const [services, setServices] = useState(() => initialServices.map(toDraft));
  const [savingId, setSavingId] = useState("");
  const [uploadingId, setUploadingId] = useState("");
  const [message, setMessage] = useState("");

  function update(id: string, patch: Partial<Draft>) {
    setServices((current) =>
      current.map((service) =>
        service.id === id ? { ...service, ...patch } : service
      )
    );
  }

  function updateVehiclePrice(
    id: string,
    vehicleTypeId: VehicleTypeId,
    value: string
  ) {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? {
              ...service,
              vehicleAdjustmentsDraft: {
                ...service.vehicleAdjustmentsDraft,
                [vehicleTypeId]: value
              }
            }
          : service
      )
    );
  }

  function updateVehicleContactPrice(
    id: string,
    vehicleTypeId: VehicleTypeId,
    checked: boolean
  ) {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? {
              ...service,
              vehicleContactPrice: {
                ...service.vehicleContactPrice,
                [vehicleTypeId]: checked
              }
            }
          : service
      )
    );
  }

  async function save(service: Draft) {
    setSavingId(service.id);
    setMessage("");

    try {
      const vehicleAdjustments = vehicleAdjustmentsFromDraft(service);
      const patch: Partial<ServicePackage> = {
        name: service.name,
        category: service.category,
        shortLabel: service.shortLabel,
        basePrice: Number(service.basePrice),
        originalPrice: service.originalPrice
          ? Number(service.originalPrice)
          : undefined,
        duration: service.duration,
        durationMinutes: Number(service.durationMinutes),
        description: service.description,
        image: service.image || undefined,
        highlights: service.highlightsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        bookable: service.bookable,
        isCampaign: service.isCampaign,
        isGiftCard: service.isGiftCard,
        vehicleAdjustments
      };

      const response = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id, patch })
      });
      const result = await readJsonResponse<{
        ok: boolean;
        service?: ServicePackage;
        error?: string;
      }>(response);

      if (!response.ok || !result.ok || !result.service) {
        throw new Error(result.error ?? "Kunde inte spara tjänsten");
      }

      setServices((current) =>
        current.map((item) =>
          item.id === result.service?.id ? toDraft(result.service) : item
        )
      );
      setMessage(`${result.service.name} sparades.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kunde inte spara");
    } finally {
      setSavingId("");
    }
  }

  async function addNewService() {
    setMessage("");
    const baseName = "Ny tjänst";
    const id = `${slugify(baseName)}-${Date.now()}`;
    const service: ServicePackage = {
      id,
      category: "Biltvättspaket",
      name: baseName,
      shortLabel: "Ny tjänst",
      basePrice: 0,
      duration: "1h",
      durationMinutes: 60,
      description: "Beskriv tjänsten här.",
      highlights: ["Uppdatera innehåll"],
      bookable: true,
      vehicleAdjustments: { ...defaultVehicleAdjustments }
    };

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service)
      });
      const result = await readJsonResponse<{
        ok: boolean;
        service?: ServicePackage;
        error?: string;
      }>(response);

      if (!response.ok || !result.ok || !result.service) {
        throw new Error(result.error ?? "Kunde inte skapa tjänsten");
      }

      setServices((current) => [toDraft(result.service!), ...current]);
      setMessage("Ny tjänst skapades. Ändra text/pris och klicka Spara.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kunde inte skapa tjänsten");
    }
  }

  async function deleteExistingService(service: Draft) {
    const confirmed = window.confirm(
      `Ta bort "${service.name}"? Den försvinner från hemsidan och bokningen.`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch("/api/admin/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id })
      });
      const result = await readJsonResponse<{
        ok: boolean;
        error?: string;
      }>(response);

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Kunde inte ta bort tjänsten");
      }

      setServices((current) => current.filter((item) => item.id !== service.id));
      setMessage(`${service.name} togs bort.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kunde inte ta bort tjänsten");
    }
  }

  async function uploadServiceImage(id: string, file: File | undefined) {
    if (!file) {
      return;
    }

    setUploadingId(id);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData
      });
      const result = await readJsonResponse<{
        ok: boolean;
        url?: string;
        error?: string;
      }>(response);

      if (!response.ok || !result.ok || !result.url) {
        throw new Error(result.error ?? "Kunde inte ladda upp bilden");
      }

      update(id, { image: result.url });
      setMessage("Bilden laddades upp. Klicka Spara för att använda den publikt.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kunde inte ladda upp bilden");
    } finally {
      setUploadingId("");
    }
  }

  return (
    <div className="grid gap-5">
      <div className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-forest-950">
            Hantera tjänster
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Lägg till, redigera eller ta bort tjänster. Ändringar syns på
            hemsidan och i bokningen direkt.
          </p>
        </div>
        <button type="button" onClick={addNewService} className="button-primary">
          <Plus size={16} />
          Lägg till tjänst
        </button>
      </div>
      {message ? (
        <p className="rounded-md border border-forest-200 bg-white px-4 py-3 text-sm font-bold text-forest-800">
          {message}
        </p>
      ) : null}
      {services.map((service) => (
        <section key={service.id} className="surface p-5">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <label>
              <span className="field-label">Namn</span>
              <input
                className="field-input mt-2"
                value={service.name}
                onChange={(event) => update(service.id, { name: event.target.value })}
              />
            </label>
            <label>
              <span className="field-label">Kategori</span>
              <select
                className="field-input mt-2"
                value={service.category}
                onChange={(event) =>
                  update(service.id, {
                    category: event.target.value as ServiceCategory
                  })
                }
              >
                {serviceCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Pris</span>
              <input
                className="field-input mt-2"
                type="number"
                value={service.basePrice}
                onChange={(event) =>
                  update(service.id, { basePrice: Number(event.target.value) })
                }
              />
            </label>
            <label>
              <span className="field-label">Ordinarie pris</span>
              <input
                className="field-input mt-2"
                type="number"
                value={service.originalPrice ?? ""}
                onChange={(event) =>
                  update(service.id, {
                    originalPrice: event.target.value
                      ? Number(event.target.value)
                      : undefined
                  })
                }
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.5fr_0.5fr]">
            <label>
              <span className="field-label">Kort etikett</span>
              <input
                className="field-input mt-2"
                value={service.shortLabel}
                onChange={(event) =>
                  update(service.id, { shortLabel: event.target.value })
                }
              />
            </label>
            <label>
              <span className="field-label">Varaktighet</span>
              <input
                className="field-input mt-2"
                value={service.duration}
                onChange={(event) =>
                  update(service.id, { duration: event.target.value })
                }
              />
            </label>
            <label>
              <span className="field-label">Minuter</span>
              <input
                className="field-input mt-2"
                type="number"
                value={service.durationMinutes}
                onChange={(event) =>
                  update(service.id, {
                    durationMinutes: Number(event.target.value)
                  })
                }
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label>
              <span className="field-label">Beskrivning</span>
              <textarea
                className="field-input mt-2 min-h-28"
                value={service.description}
                onChange={(event) =>
                  update(service.id, { description: event.target.value })
                }
              />
            </label>
            <label>
              <span className="field-label">Ingår, separerat med kommatecken</span>
              <textarea
                className="field-input mt-2 min-h-28"
                value={service.highlightsText}
                onChange={(event) =>
                  update(service.id, { highlightsText: event.target.value })
                }
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
            <label>
              <span className="field-label">Bild-URL eller uppladdad bild</span>
              <input
                className="field-input mt-2"
                value={service.image ?? ""}
                onChange={(event) => update(service.id, { image: event.target.value })}
                placeholder="/uploads/bild.jpg eller https://..."
              />
            </label>
            <label>
              <span className="field-label">Ladda upp tjänstebild</span>
              <span className="mt-2 flex gap-2">
                <input
                  className="field-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    uploadServiceImage(service.id, event.target.files?.[0])
                  }
                />
                <span className="inline-flex h-[46px] w-12 shrink-0 items-center justify-center rounded-md bg-forest-950 text-white">
                  {uploadingId === service.id ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Upload size={17} />
                  )}
                </span>
              </span>
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <div>
              <span className="field-label">Fordonspriser</span>
              <div className="mt-2 grid gap-3 rounded-md border border-black/10 bg-slate-50 p-4 sm:grid-cols-2">
                {vehicleTypeIds.map((vehicleTypeId) => (
                  <div key={vehicleTypeId} className="rounded-md bg-white p-3">
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-forest-700">
                        {vehicleTypeLabels[vehicleTypeId]}
                      </span>
                      <input
                        className="field-input mt-2"
                        type="number"
                        value={service.vehicleAdjustmentsDraft[vehicleTypeId]}
                        disabled={service.vehicleContactPrice[vehicleTypeId]}
                        onChange={(event) =>
                          updateVehiclePrice(
                            service.id,
                            vehicleTypeId,
                            event.target.value
                          )
                        }
                      />
                    </label>
                    <label className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={service.vehicleContactPrice[vehicleTypeId]}
                        onChange={(event) =>
                          updateVehicleContactPrice(
                            service.id,
                            vehicleTypeId,
                            event.target.checked
                          )
                        }
                      />
                      Kontakta oss för pris
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 rounded-md bg-slate-50 p-4">
              <label className="inline-flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={service.bookable}
                  onChange={(event) =>
                    update(service.id, { bookable: event.target.checked })
                  }
                />
                Bokningsbar
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={Boolean(service.isCampaign)}
                  onChange={(event) =>
                    update(service.id, { isCampaign: event.target.checked })
                  }
                />
                Kampanj
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={Boolean(service.isGiftCard)}
                  onChange={(event) =>
                    update(service.id, { isGiftCard: event.target.checked })
                  }
                />
                Presentkort
              </label>
            </div>
            <button
              className="button-primary h-12"
              onClick={() => save(service)}
              disabled={savingId === service.id}
            >
              {savingId === service.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Spara
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100"
              onClick={() => deleteExistingService(service)}
            >
              <Trash2 size={16} />
              Ta bort tjänst
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}
