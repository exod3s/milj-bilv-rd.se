import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Droplets, Sparkles } from "lucide-react";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1100&q=90",
    alt: "Bil täckt av lödder under handtvätt",
    label: "Handtvätt"
  },
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=90",
    alt: "Blank svart bil efter polering",
    label: "Polering"
  },
  {
    src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1100&q=90",
    alt: "Premiumbil i studio med blank finish",
    label: "Lackskydd"
  }
];

export function PhotoMosaic() {
  return (
    <section className="section-spacing bg-forest-950 text-white">
      <div className="container-padded grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-md bg-forest-300 px-3 py-2 text-sm font-black uppercase tracking-[0.12em] text-forest-950">
            <Droplets size={16} />
            Auto spa-känsla
          </p>
          <h2 className="text-3xl font-black leading-tight sm:text-4xl">
            Mer glans, mer kontrast och mer energi i varje behandling.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/78">
            Den nya visuella riktningen använder starka foton, gula accenter
            och mörka ytor för att kännas mer premium, aktiv och tydligt
            bilvårdsinriktad.
          </p>
          <div className="mt-6 grid gap-3 text-sm font-black sm:grid-cols-3">
            {[
              ["Skumtvätt", Droplets],
              ["Glansfinish", Sparkles],
              ["Kontroll", BadgeCheck]
            ].map(([label, Icon]) => (
              <div
                key={label as string}
                className="rounded-md border border-white/10 bg-white/10 p-4"
              >
                <Icon className="mb-3 text-forest-300" size={22} />
                {label as string}
              </div>
            ))}
          </div>
          <Link href="/booking" className="button-primary mt-8">
            Boka behandling
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <div
              key={photo.label}
              className={index === 0 ? "sm:col-span-2" : undefined}
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-white/10">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={index === 0 ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 27vw, 50vw"}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-md bg-forest-300 px-3 py-2 text-sm font-black text-forest-950">
                  {photo.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
