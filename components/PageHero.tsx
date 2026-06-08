type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-forest-100 bg-white">
      <div className="container-padded py-12 sm:py-16">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="max-w-4xl text-4xl font-black leading-tight text-forest-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
