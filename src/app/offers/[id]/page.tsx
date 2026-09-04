import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getOfferById } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/types";
import {
  formatAddress,
  formatOfferBadge,
  formatPromoWindow,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = getOfferById(Number(id));
  if (!offer) notFound();

  return (
    <main>
      <SiteHeader />
      <div className="site-shell py-10 sm:py-14">
        <Link href="/explore" className="text-sm font-bold text-moss">
          ← Back to explore
        </Link>

        <div className="mt-6 max-w-3xl">
          <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.08em] text-muted">
            <span className="rounded-full bg-mist px-2.5 py-1 text-pine">
              {CATEGORY_LABELS[offer.category]}
            </span>
            <span className="rounded-full bg-sand px-2.5 py-1">
              {offer.region_name}
            </span>
            <span className="rounded-full bg-[#fff3df] px-2.5 py-1 text-honey">
              {formatOfferBadge(offer)}
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl text-pine sm:text-6xl">
            {offer.business_name}
          </h1>
          <p className="mt-3 text-xl font-semibold">{offer.title}</p>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            {offer.description}
          </p>
        </div>

        <dl className="mt-10 grid max-w-4xl gap-6 border-t border-[var(--line)] pt-8 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
              Location
            </dt>
            <dd className="mt-2 text-base">{formatAddress(offer)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
              When
            </dt>
            <dd className="mt-2 text-base">
              {formatPromoWindow(offer.starts_at, offer.ends_at)}
            </dd>
          </div>
          {offer.proof_required ? (
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Proof to bring
              </dt>
              <dd className="mt-2 text-base">{offer.proof_required}</dd>
            </div>
          ) : null}
          {offer.eligibility_notes ? (
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Eligibility
              </dt>
              <dd className="mt-2 text-base">{offer.eligibility_notes}</dd>
            </div>
          ) : null}
          {offer.phone ? (
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Phone
              </dt>
              <dd className="mt-2 text-base">{offer.phone}</dd>
            </div>
          ) : null}
          {offer.website ? (
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Website
              </dt>
              <dd className="mt-2 text-base">
                <a
                  href={offer.website}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-moss underline"
                >
                  Visit site
                </a>
              </dd>
            </div>
          ) : null}
          {offer.source_url ? (
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Source
              </dt>
              <dd className="mt-2 text-base">
                <a
                  href={offer.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-moss underline"
                >
                  View source
                </a>
              </dd>
            </div>
          ) : null}
          {offer.verified_at ? (
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Last verified
              </dt>
              <dd className="mt-2 text-base">{offer.verified_at}</dd>
            </div>
          ) : null}
        </dl>
      </div>
      <SiteFooter />
    </main>
  );
}
