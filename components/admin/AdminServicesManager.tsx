"use client";

import { useState } from "react";
import { Loader2, Save, Upload } from "lucide-react";
import {
  serviceCategories,
  type ServiceCategory,
  type ServicePackage
} from "@/lib/pricing";

type Draft = ServicePackage & {
  highlightsText: string;
  vehicleRulesText: string;
};

function toDraft(service: ServicePackage): Draft {
  return {
    ...service,
    highlightsText: service.highlights.join(", "),
    vehicleRulesText: service.vehicleAdjustments
      ? JSON.stringify(service.vehicleAdjustments, null, 2)
      : ""
  };
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

  async function save(service: Draft) {
    setSavingId(service.id);
    setMessage("");

    try {
      const vehicleAdjustments = service.vehicleRulesText.trim()
        ? JSON.parse(service.vehicleRulesText)
        : undefined;
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
      const result = (await response.json()) as {
        ok: boolean;
        service?: ServicePackage;
        error?: string;
      };

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
      const result = (await response.json()) as {
        ok: boolean;
        url?: string;
        error?: string;
      };

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
            <label>
              <span className="field-label">
                Fordonsregler JSON, lämna tomt för standard
              </span>
              <textarea
                className="field-input mt-2 min-h-24 font-mono text-xs"
                value={service.vehicleRulesText}
                onChange={(event) =>
                  update(service.id, { vehicleRulesText: event.target.value })
                }
              />
            </label>
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
        </section>
      ))}
    </div>
  );
}
