"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dog,
  Droplets,
  Loader2,
  KeyRound,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  SprayCan,
  User,
  WandSparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import type {
  AvailableSlot,
  BookingRecord,
  ExtraId,
  LoanCarAvailability,
  LoanCarId,
  ServicePackageId,
  VehicleRegistrationInfo,
  VehicleTypeId
} from "@/lib/booking-types";
import {
  bookingExtras,
  calculateBookingPriceFromCatalog,
  formatCurrency,
  type ServicePackage,
  servicePackages,
  serviceCategories,
  vehicleTypes
} from "@/lib/pricing";

const steps: { label: string; icon: LucideIcon }[] = [
  { label: "Paket", icon: Sparkles },
  { label: "Fordon", icon: Car },
  { label: "Tillval", icon: WandSparkles },
  { label: "Kontakt", icon: User },
  { label: "Tid", icon: CalendarDays },
  { label: "Lånebil", icon: KeyRound },
  { label: "Granska", icon: BadgeCheck }
] as const;

const categoryIcons = {
  Biltvättspaket: Droplets,
  Rekondpaket: Sparkles,
  "Övriga Behandlingar": SprayCan,
  Däckverksamhet: Car,
  Husbil: Car,
  Presentkort: BadgeCheck,
  Rabatter: WandSparkles
} as const satisfies Record<(typeof serviceCategories)[number], LucideIcon>;

const vehicleIcons: Record<VehicleTypeId, LucideIcon> = {
  sedan: Car,
  kombi: Car,
  suv: Car,
  "7-sits": Car
};

const extraIcons: Record<ExtraId, LucideIcon> = {
  "dog-hair": Dog
};

type BookingFormProps = {
  availableSlots: AvailableSlot[];
  initialServiceId?: ServicePackageId;
  services?: ServicePackage[];
  variant?: "page" | "hero";
};

type CustomerState = {
  name: string;
  email: string;
  phone: string;
  licensePlate: string;
  vehicleInfo?: VehicleRegistrationInfo;
  message: string;
};

type VehicleLookupResponse =
  | {
      ok: true;
      vehicle: VehicleRegistrationInfo;
    }
  | {
      ok: false;
      error: string;
    };

type BookingResponse =
  | {
      ok: true;
      booking: Pick<BookingRecord, "id" | "date" | "time" | "price"> & {
        service: string;
        vehicleType: string;
        duration: string;
        loanCar?: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

export function BookingForm({
  availableSlots,
  initialServiceId,
  services = [...servicePackages],
  variant = "page"
}: BookingFormProps) {
  const isHero = variant === "hero";
  const initialCategory =
    services.find((service) => service.id === initialServiceId)?.category ??
    "Biltvättspaket";
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof serviceCategories)[number]>(initialCategory);
  const [serviceId, setServiceId] = useState<ServicePackageId | "">(
    initialServiceId ?? ""
  );
  const [expandedServiceId, setExpandedServiceId] = useState<
    ServicePackageId | ""
  >(initialServiceId ?? "");
  const [vehicleTypeId, setVehicleTypeId] = useState<VehicleTypeId | "">("");
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [pickupDropoff, setPickupDropoff] = useState(false);
  const [customer, setCustomer] = useState<CustomerState>({
    name: "",
    email: "",
    phone: "",
    licensePlate: "",
    message: ""
  });
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [loanCarId, setLoanCarId] = useState<LoanCarId | "">("");
  const [loanCars, setLoanCars] = useState<LoanCarAvailability[]>([]);
  const [isLoadingLoanCars, setIsLoadingLoanCars] = useState(false);
  const [loanCarError, setLoanCarError] = useState("");
  const [formError, setFormError] = useState("");
  const [vehicleLookupError, setVehicleLookupError] = useState("");
  const [isLookingUpVehicle, setIsLookingUpVehicle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingResponse | null>(
    null
  );

  const selectedSlot = availableSlots.find((slot) => slot.id === selectedSlotId);
  const selectedService = services.find((service) => service.id === serviceId);
  const visibleSlots = isHero ? availableSlots.slice(0, 6) : availableSlots;
  const bookableCategories = serviceCategories.filter((category) =>
    services.some((service) => service.bookable && service.category === category)
  );
  const visibleServices = services.filter(
    (service) => service.bookable && service.category === selectedCategory
  );

  const priceSummary = useMemo(() => {
    if (!serviceId || !vehicleTypeId) {
      return null;
    }

    try {
      return calculateBookingPriceFromCatalog(services, {
        serviceId,
        vehicleTypeId,
        extras
      });
    } catch {
      return null;
    }
  }, [extras, serviceId, services, vehicleTypeId]);

  const selectedVehicleRestriction =
    serviceId === "summer-discount" &&
    (vehicleTypeId === "suv" || vehicleTypeId === "7-sits");

  useEffect(() => {
    if (!selectedSlot || !selectedService) {
      setLoanCars([]);
      setLoanCarId("");
      return;
    }

    const controller = new AbortController();
    const slot = selectedSlot;
    const service = selectedService;

    async function loadLoanCars() {
      setIsLoadingLoanCars(true);
      setLoanCarError("");

      try {
        const params = new URLSearchParams({
          date: slot.date,
          time: slot.time,
          durationMinutes: String(service.durationMinutes)
        });
        const response = await fetch(`/api/loan-cars?${params}`, {
          signal: controller.signal
        });
        const result = (await response.json()) as {
          ok: boolean;
          cars?: LoanCarAvailability[];
          error?: string;
        };

        if (!response.ok || !result.ok || !result.cars) {
          throw new Error(result.error ?? "Kunde inte hämta lånebilar");
        }

        setLoanCars(result.cars);
        setLoanCarId((current) =>
          current && result.cars?.some((car) => car.id === current && car.available)
            ? current
            : ""
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setLoanCarError(
          error instanceof Error ? error.message : "Kunde inte hämta lånebilar"
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingLoanCars(false);
        }
      }
    }

    void loadLoanCars();
    return () => controller.abort();
  }, [selectedService, selectedSlot]);

  function updateCustomer(field: keyof CustomerState, value: string) {
    setCustomer((current) => ({
      ...current,
      [field]: value,
      ...(field === "licensePlate" ? { vehicleInfo: undefined } : {})
    }));

    if (field === "licensePlate") {
      setVehicleLookupError("");
    }
  }

  function toggleExtra(extraId: ExtraId) {
    setExtras((current) =>
      current.includes(extraId)
        ? current.filter((id) => id !== extraId)
        : [...current, extraId]
    );
  }

  function validateStep(currentStep: number) {
    if (currentStep === 0 && !serviceId) {
      return "Välj ett servicepaket för att gå vidare.";
    }

    if (currentStep === 1 && !vehicleTypeId) {
      return "Välj fordonstyp för att kunna räkna ut priset.";
    }

    if (currentStep === 3) {
      if (customer.name.trim().length < 2) {
        return "Ange namn.";
      }
      if (!customer.email.includes("@")) {
        return "Ange en giltig e-postadress.";
      }
      if (customer.phone.trim().length < 6) {
        return "Ange telefonnummer.";
      }
      if (customer.licensePlate.trim().length < 2) {
        return "Registreringsnummer krävs.";
      }
    }

    if (currentStep === 4 && !selectedSlot) {
      return "Välj en ledig tid.";
    }

    return "";
  }

  async function lookupVehicle() {
    const plate = customer.licensePlate.trim();

    if (plate.length < 2) {
      setVehicleLookupError("Skriv registreringsnummer först.");
      return;
    }

    setIsLookingUpVehicle(true);
    setVehicleLookupError("");

    try {
      const response = await fetch(
        `/api/vehicle-lookup?plate=${encodeURIComponent(plate)}`
      );
      const result = (await response.json()) as VehicleLookupResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.ok ? "Kunde inte hämta fordonsinfo." : result.error);
      }

      setCustomer((current) => ({
        ...current,
        licensePlate: result.vehicle.licensePlate,
        vehicleInfo: result.vehicle
      }));
      setVehicleTypeId(result.vehicle.suggestedVehicleTypeId);
    } catch (lookupError) {
      setVehicleLookupError(
        lookupError instanceof Error
          ? lookupError.message
          : "Kunde inte hämta fordonsinfo just nu."
      );
    } finally {
      setIsLookingUpVehicle(false);
    }
  }

  function goNext() {
    const error = validateStep(step);

    if (error) {
      setFormError(error);
      return;
    }

    setFormError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setFormError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submitBooking() {
    const error = validateStep(4);

    if (error || !serviceId || !vehicleTypeId || !selectedSlot || !priceSummary) {
      setFormError(error || "Kontrollera bokningen innan du skickar.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setConfirmation(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceId,
          vehicleTypeId,
          extras,
          pickupDropoff,
          loanCarId: loanCarId || undefined,
          customer,
          date: selectedSlot.date,
          time: selectedSlot.time
        })
      });

      const result = (await response.json()) as BookingResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.ok ? "Bokningen kunde inte skickas." : result.error);
      }

      setConfirmation(result);
      setStep(steps.length - 1);
    } catch (bookingError) {
      setFormError(
        bookingError instanceof Error
          ? bookingError.message
          : "Något gick fel. Försök igen."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmation?.ok) {
    return (
      <div className="surface p-6 sm:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-forest-600 text-white">
          <Check size={24} />
        </div>
        <p className="eyebrow mb-3">Bokning mottagen</p>
        <h2 className="text-3xl font-black text-forest-950">
          Tack! Din bokningsförfrågan är bekräftad.
        </h2>
        <p className="mt-4 leading-7 text-slate-600">
          Vi har tagit emot bokning {confirmation.booking.id}. En bekräftelse
          visas här och skickas även via e-post när e-posttjänsten är ansluten.
        </p>
        <div className="mt-6 grid gap-3 rounded-md bg-forest-50 p-4 text-sm font-semibold text-forest-950 sm:grid-cols-3">
          <span>Paket: {confirmation.booking.service}</span>
          <span>Fordonstyp: {confirmation.booking.vehicleType}</span>
          <span>Varaktighet: {confirmation.booking.duration}</span>
          <span>Lånebil: {confirmation.booking.loanCar ?? "Ingen"}</span>
          <span>Datum: {confirmation.booking.date}</span>
          <span>Tid: {confirmation.booking.time}</span>
          <span>Slutpris: {formatCurrency(confirmation.booking.price.total)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("surface w-full min-w-0 overflow-hidden", isHero && "shadow-none")}>
      <div className={clsx("border-b border-forest-100 bg-white", isHero ? "p-2 sm:p-3" : "p-4 sm:p-6")}>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {steps.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (index <= step) {
                    setStep(index);
                    setFormError("");
                  }
                }}
                className={clsx(
                  "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-center text-[10px] font-black transition sm:px-2 sm:text-xs",
                  index === step
                    ? "bg-forest-950 text-white"
                    : index < step
                      ? "bg-forest-100 text-forest-800"
                      : "bg-slate-100 text-slate-500"
                )}
              >
                <Icon size={isHero ? 22 : 25} strokeWidth={2.2} />
                <span className="block max-w-full truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={clsx(
          "grid",
          isHero ? "min-w-0 gap-4 p-2 sm:p-3" : "min-w-0 gap-8 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
        )}
      >
        <div className="min-w-0">
          {step === 0 ? (
            <StepShell
              title="Välj servicepaket"
              description="Börja med behandlingen som passar bilen bäst. Priset uppdateras när fordonstyp och tillval är valda."
              compact={isHero}
            >
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {bookableCategories.map((category) => {
                  const Icon = categoryIcons[category];

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={clsx(
                        "inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-black transition",
                        selectedCategory === category
                          ? "border-forest-950 bg-forest-950 text-white"
                          : "border-black/10 bg-white text-forest-950 hover:border-forest-300"
                      )}
                    >
                      <Icon size={15} />
                      {category}
                    </button>
                  );
                })}
              </div>

              <div className={clsx("grid", isHero ? "gap-2" : "gap-3")}>
                {visibleServices.map((service) => (
                  <PackageAccordionCard
                    key={service.id}
                    active={serviceId === service.id}
                    expanded={expandedServiceId === service.id}
                    onToggle={() =>
                      setExpandedServiceId((current) =>
                        current === service.id ? "" : service.id
                      )
                    }
                    onSelect={() => {
                      setServiceId(service.id);
                      setFormError("");
                      setStep(1);
                    }}
                    service={service}
                    icon={categoryIcons[service.category]}
                    compact={isHero}
                  />
                ))}
              </div>
            </StepShell>
          ) : null}

          {step === 1 ? (
            <StepShell
              title="Välj fordonstyp"
              description="Större bilar tar längre tid och får ett tydligt fordonstillägg."
              compact={isHero}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {vehicleTypes.map((vehicleType) => (
                  <ChoiceButton
                    key={vehicleType.id}
                    active={vehicleTypeId === vehicleType.id}
                    onClick={() => setVehicleTypeId(vehicleType.id)}
                    title={vehicleType.name}
                    meta={`+${formatCurrency(vehicleType.adjustment)}`}
                    icon={vehicleIcons[vehicleType.id]}
                    compact={isHero}
                  />
                ))}
              </div>
              {customer.vehicleInfo ? (
                <VehicleInfoCard vehicle={customer.vehicleInfo} className="mt-5" />
              ) : (
                <div className="mt-5 rounded-md border border-forest-100 bg-forest-50 p-4 text-sm leading-6 text-forest-800">
                  Tips: skriv registreringsnummer i nästa steg så kan fordonstyp
                  fyllas i automatiskt.
                </div>
              )}
            </StepShell>
          ) : null}

          {step === 2 ? (
            <StepShell
              title="Lägg till tillval"
              description="Tillval är frivilliga. Upphämtning och lämning är en förfrågan och räknas inte in i priset ännu."
              compact={isHero}
            >
              <div className="grid gap-3">
                {bookingExtras.map((extra) => {
                  const Icon = extraIcons[extra.id];

                  return (
                    <label
                      key={extra.id}
                      className={clsx(
                        "flex cursor-pointer gap-3 rounded-md border p-4 transition",
                        extras.includes(extra.id)
                          ? "border-forest-600 bg-forest-50"
                          : "border-forest-100 bg-white hover:border-forest-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-forest-700"
                        checked={extras.includes(extra.id)}
                        onChange={() => toggleExtra(extra.id)}
                      />
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-forest-700">
                        <Icon size={21} />
                      </span>
                      <span>
                        <span className="block font-black text-forest-950">
                          {extra.name} · +{formatCurrency(extra.price)}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-slate-600">
                          {extra.description}
                        </span>
                      </span>
                    </label>
                  );
                })}

                <label
                  className={clsx(
                    "flex cursor-pointer gap-3 rounded-md border p-4 transition",
                    pickupDropoff
                      ? "border-forest-600 bg-forest-50"
                      : "border-forest-100 bg-white hover:border-forest-300"
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-forest-700"
                    checked={pickupDropoff}
                    onChange={() => setPickupDropoff((value) => !value)}
                  />
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-forest-700">
                    <Car size={21} />
                  </span>
                  <span>
                    <span className="block font-black text-forest-950">
                      Förfrågan om upphämtning/lämning
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">
                      Pris och tillgänglighet bekräftas separat av oss.
                    </span>
                  </span>
                </label>
              </div>
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell
              title="Dina uppgifter"
              description="Registreringsnummer är obligatoriskt så att vi kan matcha bilen med bokningen."
              compact={isHero}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Namn">
                  <InputWithIcon icon={User}>
                    <input
                      aria-label="Namn"
                      className="field-input pl-10"
                      value={customer.name}
                      onChange={(event) =>
                        updateCustomer("name", event.target.value)
                      }
                      autoComplete="name"
                      required
                    />
                  </InputWithIcon>
                </Field>
                <Field label="E-post">
                  <InputWithIcon icon={Mail}>
                    <input
                      aria-label="E-post"
                      className="field-input pl-10"
                      type="email"
                      value={customer.email}
                      onChange={(event) =>
                        updateCustomer("email", event.target.value)
                      }
                      autoComplete="email"
                      required
                    />
                  </InputWithIcon>
                </Field>
                <Field label="Telefon">
                  <InputWithIcon icon={Phone}>
                    <input
                      aria-label="Telefon"
                      className="field-input pl-10"
                      type="tel"
                      value={customer.phone}
                      onChange={(event) =>
                        updateCustomer("phone", event.target.value)
                      }
                      autoComplete="tel"
                      required
                    />
                  </InputWithIcon>
                </Field>
                <Field label="Registreringsnummer">
                  <div className="flex gap-2">
                    <InputWithIcon icon={Car} className="min-w-0 flex-1">
                      <input
                        aria-label="Registreringsnummer"
                        className="field-input uppercase pl-10"
                        value={customer.licensePlate}
                        onChange={(event) =>
                          updateCustomer("licensePlate", event.target.value)
                        }
                        placeholder="ABC123"
                        required
                      />
                    </InputWithIcon>
                    <button
                      type="button"
                      onClick={lookupVehicle}
                      disabled={isLookingUpVehicle}
                      className="inline-flex h-[46px] shrink-0 items-center justify-center rounded-md bg-forest-950 px-4 text-sm font-black text-white transition hover:bg-forest-800 disabled:cursor-wait disabled:opacity-70"
                    >
                      {isLookingUpVehicle ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Search size={18} />
                      )}
                      <span className="ml-2 hidden sm:inline">Hämta</span>
                      <span className="sr-only">fordonsinfo</span>
                    </button>
                  </div>
                </Field>
                {customer.vehicleInfo ? (
                  <VehicleInfoCard
                    vehicle={customer.vehicleInfo}
                    className="sm:col-span-2"
                  />
                ) : null}
                {vehicleLookupError ? (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 sm:col-span-2">
                    {vehicleLookupError}
                  </p>
                ) : null}
                <Field label="Meddelande" className="sm:col-span-2">
                  <InputWithIcon icon={MessageSquare} alignTop>
                    <textarea
                      aria-label="Meddelande"
                      className="field-input min-h-32 resize-y pl-10"
                      value={customer.message}
                      onChange={(event) =>
                        updateCustomer("message", event.target.value)
                      }
                      placeholder="Berätta gärna om särskilda önskemål, fläckar eller tider som passar extra bra."
                    />
                  </InputWithIcon>
                </Field>
              </div>
            </StepShell>
          ) : null}

          {step === 4 ? (
            <StepShell
              title="Välj datum och tid"
              description="Lediga tider kommer just nu från mockdata. Kalenderhjälpen är förberedd för Google Calendar free/busy."
              compact={isHero}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      setSelectedSlotId(slot.id);
                      setLoanCarId("");
                    }}
                    className={clsx(
                      "rounded-md border p-4 text-left transition",
                      selectedSlotId === slot.id
                        ? "border-forest-600 bg-forest-50"
                        : "border-forest-100 bg-white hover:border-forest-300"
                    )}
                  >
                    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-forest-50 text-forest-700">
                      <Clock size={20} />
                    </span>
                    <span className="block font-black text-forest-950">
                      {slot.date}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-forest-700">
                      Kl. {slot.time}
                    </span>
                    <span className="mt-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Ledig tid
                    </span>
                  </button>
                ))}
              </div>
            </StepShell>
          ) : null}

          {step === 5 ? (
            <StepShell
              title="Välj lånebil"
              description="Lånebil är kostnadsfri och reserveras under hela behandlingstiden. Du kan också fortsätta utan lånebil."
              compact={isHero}
            >
              {isLoadingLoanCars ? (
                <div className="flex items-center gap-3 rounded-md border border-forest-100 bg-forest-50 p-4 text-sm font-bold text-forest-800">
                  <Loader2 size={18} className="animate-spin" />
                  Kontrollerar vilka lånebilar som är lediga...
                </div>
              ) : null}

              {loanCarError ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  {loanCarError}. Du kan fortsätta utan lånebil.
                </p>
              ) : null}

              {!isLoadingLoanCars && !loanCarError ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceButton
                    active={!loanCarId}
                    onClick={() => setLoanCarId("")}
                    title="Ingen lånebil"
                    meta="Jag ordnar transport själv"
                    icon={Car}
                    compact={isHero}
                  />
                  {loanCars.map((car) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => car.available && setLoanCarId(car.id)}
                      disabled={!car.available}
                      className={clsx(
                        "rounded-md border p-4 text-left transition",
                        loanCarId === car.id
                          ? "border-forest-600 bg-forest-50"
                          : "border-forest-100 bg-white",
                        car.available
                          ? "hover:-translate-y-0.5 hover:border-forest-300"
                          : "cursor-not-allowed bg-slate-100 opacity-60"
                      )}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className={clsx(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-md",
                            loanCarId === car.id
                              ? "bg-forest-600 text-white"
                              : "bg-forest-50 text-forest-700"
                          )}
                        >
                          <KeyRound size={23} />
                        </span>
                        <span>
                          <span className="block font-black text-forest-950">
                            {car.name}
                          </span>
                          <span
                            className={clsx(
                              "mt-1 block text-sm font-bold",
                              car.available ? "text-forest-700" : "text-slate-500"
                            )}
                          >
                            {car.available
                              ? "Ledig under din bokning"
                              : car.unavailableReason}
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </StepShell>
          ) : null}

          {step === 6 ? (
            <StepShell
              title="Granska och bekräfta"
              description="Kontrollera detaljerna innan du skickar bokningen. Priset räknas även om i backend."
              compact={isHero}
            >
              <ReviewDetails
                services={services}
                serviceId={serviceId}
                vehicleTypeId={vehicleTypeId}
                extras={extras}
                pickupDropoff={pickupDropoff}
                customer={customer}
                selectedSlot={selectedSlot}
                loanCarId={loanCarId}
                loanCars={loanCars}
                priceSummary={priceSummary}
                vehicleInfo={customer.vehicleInfo}
              />
            </StepShell>
          ) : null}

          {formError ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {formError}
            </p>
          ) : null}

          {selectedVehicleRestriction ? (
            <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Detta erbjudande gäller endast sedan och kombi. För SUV och
              7-sits, kontakta oss för pris.
            </p>
          ) : null}

          {isHero ? (
            <CompactPriceSummary
              priceSummary={priceSummary}
              pickupDropoff={pickupDropoff}
            />
          ) : null}

          <div className={clsx("flex flex-col-reverse gap-3 sm:flex-row sm:justify-between", isHero ? "mt-4" : "mt-7")}>
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || isSubmitting}
              className="button-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Tillbaka
            </button>

            {step < steps.length - 1 ? (
              <button type="button" onClick={goNext} className="button-primary">
                Nästa
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitBooking}
                disabled={isSubmitting || selectedVehicleRestriction}
                className="button-primary disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Bekräfta bokning
              </button>
            )}
          </div>
        </div>

        {!isHero ? (
        <aside className="h-fit rounded-lg border border-forest-100 bg-forest-50 p-5">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-forest-700">
            Prisöversikt
          </p>
          {priceSummary ? (
            <div className="mt-4 grid gap-3">
              {customer.vehicleInfo ? (
                <div className="rounded-md bg-white p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-forest-600">
                    Hämtad bil
                  </p>
                  <p className="mt-1 font-black text-forest-950">
                    {customer.vehicleInfo.make} {customer.vehicleInfo.model}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {customer.vehicleInfo.licensePlate} ·{" "}
                    {customer.vehicleInfo.year}
                  </p>
                </div>
            ) : null}
              {priceSummary.lines.map((line) => (
                <div
                  key={`${line.type}-${line.label}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-slate-700">{line.label}</span>
                  <span className="font-black text-forest-950">
                    {formatCurrency(line.amount)}
                  </span>
                </div>
              ))}
              {pickupDropoff ? (
                <div className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-forest-700">
                  Upphämtning/lämning: pris bekräftas separat.
                </div>
              ) : null}
              <div className="mt-2 border-t border-forest-200 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-black text-forest-950">Totalpris</span>
                  <span className="text-2xl font-black text-forest-950">
                    {formatCurrency(priceSummary.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Välj servicepaket och fordonstyp för att se totalpriset.
            </p>
          )}
        </aside>
        ) : null}
      </div>
    </div>
  );
}

function StepShell({
  title,
  description,
  children,
  compact = false
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section>
      <h2 className={clsx("font-black text-forest-950", compact ? "text-xl" : "text-2xl")}>{title}</h2>
      <p className={clsx("mt-2 max-w-2xl text-sm leading-6 text-slate-600", compact && "hidden sm:block")}>
        {description}
      </p>
      <div className={compact ? "mt-4" : "mt-6"}>{children}</div>
    </section>
  );
}

function ChoiceButton({
  active,
  onClick,
  title,
  meta,
  description,
  icon: Icon,
  compact = false
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  meta?: string;
  description?: string;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-md border text-left transition hover:-translate-y-0.5",
        compact ? "p-3" : "p-4",
        active
          ? "border-forest-600 bg-forest-50"
          : "border-forest-100 bg-white hover:border-forest-300"
      )}
    >
      <span className="flex items-start gap-3">
        {Icon ? (
          <span
            className={clsx(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-md",
              compact && "h-10 w-10",
              active ? "bg-forest-600 text-white" : "bg-forest-50 text-forest-700"
            )}
          >
            <Icon size={23} />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="font-black text-forest-950">{title}</span>
            {active ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-forest-600 text-white">
                <Check size={14} />
              </span>
            ) : null}
          </span>
          {meta ? (
            <span className="mt-1 block text-sm font-bold text-forest-700">
              {meta}
            </span>
          ) : null}
          {description && !compact ? (
            <span className="mt-2 block text-sm leading-6 text-slate-600">
              {description}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function PackageAccordionCard({
  active,
  expanded,
  onToggle,
  onSelect,
  service,
  icon: Icon,
  compact = false
}: {
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  service: ServicePackage;
  icon: LucideIcon;
  compact?: boolean;
}) {
  return (
    <article
      className={clsx(
        "rounded-md border bg-white text-left transition hover:-translate-y-0.5",
        active || expanded
          ? "border-forest-400 ring-2 ring-forest-100"
          : "border-black/10",
        compact ? "p-3" : "p-4"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-w-0 items-center gap-3 text-left"
        aria-expanded={expanded}
      >
        <span
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
            active || expanded
              ? "bg-forest-300 text-forest-950"
              : "bg-forest-50 text-forest-700"
          )}
        >
          <Icon size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="grid gap-1 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
            <span className="min-w-0 break-words font-black text-forest-950">
              {service.name}
            </span>
            <span className="shrink-0 font-black text-forest-950">
              från {formatCurrency(service.basePrice)}
            </span>
          </span>
          <span className="mt-1 block text-sm font-bold text-forest-700">
            {service.shortLabel}
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="mt-4 border-t border-black/10 pt-4">
          <p className="text-sm leading-6 text-slate-700">
            {service.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {service.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-md bg-polish-mist px-3 py-2 text-xs font-black text-forest-950"
              >
                {highlight}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-black text-forest-700">
              Varaktighet: {service.duration}
            </span>
            <button type="button" onClick={onSelect} className="button-primary py-2">
              Välj paket
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function InputWithIcon({
  icon: Icon,
  className,
  alignTop = false,
  children
}: {
  icon: LucideIcon;
  className?: string;
  alignTop?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={clsx("relative block", className)}>
      <Icon
        size={18}
        className={clsx(
          "pointer-events-none absolute left-3 text-forest-600",
          alignTop ? "top-3.5" : "top-1/2 -translate-y-1/2"
        )}
      />
      {children}
    </span>
  );
}

function VehicleInfoCard({
  vehicle,
  className
}: {
  vehicle: VehicleRegistrationInfo;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-forest-200 bg-gradient-to-br from-forest-50 to-white p-4",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-forest-950 text-white">
            <Car size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">
              Fordonsinfo hämtad
            </p>
            <p className="text-lg font-black text-forest-950">
              {vehicle.make} {vehicle.model}
            </p>
          </div>
        </div>
        <span className="w-fit rounded-md bg-white px-3 py-2 text-sm font-black text-forest-950 shadow-sm">
          {vehicle.licensePlate}
        </span>
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
        <VehicleFact label="Årsmodell" value={String(vehicle.year)} />
        <VehicleFact label="Kaross" value={vehicle.bodyType} />
        <VehicleFact label="Färg" value={vehicle.color} />
        <VehicleFact label="Drivmedel" value={vehicle.fuelType} />
      </div>
      <p className="mt-4 rounded-md bg-white px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
        Demo just nu: informationen kommer från mockdata. Byt ut lookup-helpern
        mot en riktig fordonsdataleverantör när API-åtkomst finns.
      </p>
    </div>
  );
}

function VehicleFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-forest-600">
        {label}
      </p>
      <p className="mt-1 font-black text-forest-950">{value}</p>
    </div>
  );
}

function CompactPriceSummary({
  priceSummary,
  pickupDropoff
}: {
  priceSummary: ReturnType<typeof calculateBookingPriceFromCatalog> | null;
  pickupDropoff: boolean;
}) {
  return (
    <div className="mt-4 rounded-md border border-forest-200 bg-forest-50 p-3">
      {priceSummary ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-forest-700">
              Totalpris
            </p>
            <p className="text-2xl font-black text-forest-950">
              {formatCurrency(priceSummary.total)}
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            {priceSummary.lines.map((line) => line.label).join(" + ")}
            {pickupDropoff ? " + upphämtning/lämning förfrågan" : ""}
          </div>
        </div>
      ) : (
        <p className="text-sm font-semibold text-slate-700">
          Välj servicepaket och fordonstyp för att se totalpris.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  className,
  children
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={clsx("grid gap-2", className)}>
      <span className="field-label">{label}</span>
      {children}
    </div>
  );
}

function ReviewDetails({
  services,
  serviceId,
  vehicleTypeId,
  extras,
  pickupDropoff,
  customer,
  selectedSlot,
  loanCarId,
  loanCars,
  priceSummary,
  vehicleInfo
}: {
  services: ServicePackage[];
  serviceId: ServicePackageId | "";
  vehicleTypeId: VehicleTypeId | "";
  extras: ExtraId[];
  pickupDropoff: boolean;
  customer: CustomerState;
  selectedSlot?: AvailableSlot;
  loanCarId: LoanCarId | "";
  loanCars: LoanCarAvailability[];
  priceSummary: ReturnType<typeof calculateBookingPriceFromCatalog> | null;
  vehicleInfo?: VehicleRegistrationInfo;
}) {
  const service = services.find((item) => item.id === serviceId);
  const vehicleType = vehicleTypes.find((item) => item.id === vehicleTypeId);
  const selectedExtras = bookingExtras.filter((extra) => extras.includes(extra.id));

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 rounded-md border border-forest-100 bg-white p-4 sm:grid-cols-2">
        <SummaryItem label="Service" value={service?.name ?? "-"} />
        <SummaryItem label="Fordon" value={vehicleType?.name ?? "-"} />
        <SummaryItem label="Varaktighet" value={service?.duration ?? "-"} />
        <SummaryItem
          label="Datum och tid"
          value={selectedSlot ? `${selectedSlot.date} kl. ${selectedSlot.time}` : "-"}
        />
        <SummaryItem
          label="Lånebil"
          value={
            loanCars.find((car) => car.id === loanCarId)?.name ??
            "Ingen lånebil"
          }
        />
        <SummaryItem label="Registreringsnummer" value={customer.licensePlate || "-"} />
        <SummaryItem label="Namn" value={customer.name || "-"} />
        <SummaryItem label="Telefon" value={customer.phone || "-"} />
        <SummaryItem label="E-post" value={customer.email || "-"} />
        <SummaryItem
          label="Tillval"
          value={
            [
              ...selectedExtras.map((extra) => extra.name),
              pickupDropoff ? "Upphämtning/lämning begärd" : ""
            ]
              .filter(Boolean)
              .join(", ") || "Inga tillval"
          }
        />
      </div>

      {customer.message ? (
        <div className="rounded-md border border-forest-100 bg-white p-4">
          <SummaryItem label="Meddelande" value={customer.message} />
        </div>
      ) : null}

      {vehicleInfo ? <VehicleInfoCard vehicle={vehicleInfo} /> : null}

      {priceSummary ? (
        <div className="rounded-md bg-forest-950 p-5 text-white">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-forest-200">
            Totalpris
          </p>
          <p className="mt-2 text-4xl font-black">
            {formatCurrency(priceSummary.total)}
          </p>
          <p className="mt-2 text-sm text-forest-100">
            Priset inkluderar valt paket, fordonstillägg och valda tillval.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-forest-600">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-forest-950">
        {value}
      </p>
    </div>
  );
}
