import { BadgeCheck, Car, Leaf, ShieldCheck } from "lucide-react";

const badges = [
  {
    title: "Miljövänliga produkter",
    description: "Skonsamma medel med fokus på bilen, kunden och miljön.",
    icon: Leaf
  },
  {
    title: "Professionell utrustning",
    description: "Rätt maskiner, dukar och metoder för ett säkert resultat.",
    icon: BadgeCheck
  },
  {
    title: "Lånebil finns",
    description: "Fråga vid bokning om du behöver lånebil under behandlingen.",
    icon: Car
  },
  {
    title: "Nöjd kund-garanti",
    description: "Vi går igenom resultatet tillsammans innan du hämtar bilen.",
    icon: ShieldCheck
  }
];

export function TrustBadges() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => {
        const Icon = badge.icon;

        return (
          <div key={badge.title} className="surface p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-forest-300 text-forest-950">
              <Icon size={22} />
            </div>
            <h3 className="font-black text-forest-950">{badge.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {badge.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
