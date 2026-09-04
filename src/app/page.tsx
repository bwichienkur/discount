import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { listActiveOffers } from "@/lib/db";

export default function HomePage() {
  const offerCount = listActiveOffers().length;

  return (
    <main>
      <section className="relative min-h-[100svh] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(105deg, rgba(15,47,38,0.88) 0%, rgba(15,47,38,0.55) 42%, rgba(15,47,38,0.28) 100%), url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(217,239,228,0.35), transparent 35%), radial-gradient(circle at 80% 70%, rgba(201,133,44,0.2), transparent 30%)",
          }}
        />

        <SiteHeader variant="transparent" />

        <div className="site-shell relative z-10 flex min-h-[calc(100svh-88px)] flex-col justify-end pb-16 pt-10 sm:justify-center sm:pb-24">
          <p className="fade-up mb-4 max-w-xl text-sm font-bold uppercase tracking-[0.22em] text-[#d9efe4]">
            Georgia foster & kinship families
          </p>
          <h1 className="fade-up font-display text-[clamp(3.4rem,10vw,7.5rem)] leading-[0.9] tracking-[-0.03em] text-white">
            Open Door GA
          </h1>
          <p className="fade-up-delay mt-6 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
            Free meals, discounted gyms, zoo days, aquarium visits, and more —
            mapped for families opening their homes across Georgia.
          </p>
          <div className="fade-up-delay-2 mt-8 flex flex-wrap items-center gap-3">
            <Link href="/explore" className="btn btn-primary bg-honey text-pine-deep hover:bg-[#b87724]">
              Explore Georgia offers
            </Link>
            <Link href="/admin" className="btn btn-secondary">
              Add a location
            </Link>
          </div>
          <p className="fade-up-delay-2 mt-6 text-sm font-medium text-white/75">
            {offerCount} active offer{offerCount === 1 ? "" : "s"} · filter by
            region coming next
          </p>
        </div>

        <div
          aria-hidden
          className="drift pointer-events-none absolute bottom-10 right-[8%] hidden h-28 w-28 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm sm:block"
        />
      </section>

      <section className="site-shell py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl text-pine sm:text-5xl">
            One place for Georgia doors that open wider.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Browse verified promotions by category and region. Every listing can
            include discount details, free admission flags, promo dates, and what
            proof to bring.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Map + list",
              body: "See restaurants, attractions, museums, gyms, and more across the state.",
            },
            {
              title: "Manual curation",
              body: "Admins enter offers by hand so families get accurate, foster-specific details.",
            },
            {
              title: "Region ready",
              body: "Georgia regions are built in from day one for Metro Atlanta through Coastal.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className="border-t border-[var(--line)] pt-5"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <h3 className="font-display text-2xl text-pine">{item.title}</h3>
              <p className="mt-2 text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
