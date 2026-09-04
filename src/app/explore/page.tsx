import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { OfferRow } from "@/components/OfferRow";
import { OffersMapClient } from "@/components/OffersMapClient";
import { ExploreFilters } from "@/components/ExploreFilters";
import { listActiveOffers, listRegions } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const region = typeof sp.region === "string" ? sp.region : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const freeOnly = sp.free === "1";

  const regions = listRegions();
  const offers = listActiveOffers({ region, category, q, freeOnly });

  return (
    <main>
      <SiteHeader />
      <div className="site-shell py-8 sm:py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-moss">
            Explore Georgia
          </p>
          <h1 className="mt-2 font-display text-4xl text-pine sm:text-5xl">
            Offers near foster & kinship families
          </h1>
          <p className="mt-3 text-muted">
            Filter by region and category. Pins show free (gold) and discounted
            (green) locations.
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={null}>
            <ExploreFilters regions={regions} />
          </Suspense>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <OffersMapClient offers={offers} />
          <div>
            <p className="mb-2 text-sm font-bold text-muted">
              {offers.length} result{offers.length === 1 ? "" : "s"}
            </p>
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-white/70 px-4 sm:px-5">
              {offers.length === 0 ? (
                <p className="py-10 text-muted">
                  No matching offers yet. Try another region or add one in Admin.
                </p>
              ) : (
                offers.map((offer) => <OfferRow key={offer.id} offer={offer} />)
              )}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
