import type { Metadata } from "next";
import { BookingForm } from "@/components/BookingForm";
import { PageHero } from "@/components/PageHero";
import { getAvailableSlots } from "@/lib/google-calendar";
import { readServices } from "@/lib/service-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boka bilvård online",
  description:
    "Boka biltvätt, rekond, polering eller lackskydd online hos Miljö Bilvård i Ö-vik. Se totalpris innan du bekräftar."
};

type BookingPageProps = {
  searchParams?: Promise<{
    service?: string;
  }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = searchParams ? await searchParams : {};
  const requestedService = params.service;
  const availableSlots = await getAvailableSlots();
  const services = await readServices();
  const initialServiceId =
    requestedService && services.some((service) => service.id === requestedService)
      ? requestedService
      : undefined;

  return (
    <>
      <PageHero
        eyebrow="Boka online"
        title="Boka bilvård med tydligt totalpris."
        description="Följ stegen, välj paket och fordonstyp, lägg till eventuella tillval och välj en ledig tid. Registreringsnummer krävs för att bekräfta."
      />

      <section className="section-spacing bg-white">
        <div className="container-padded">
          <BookingForm
            availableSlots={availableSlots}
            services={services}
            initialServiceId={initialServiceId}
          />
        </div>
      </section>
    </>
  );
}
