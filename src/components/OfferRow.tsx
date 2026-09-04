import Link from "next/link";
import type { OfferWithBusiness } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import {
  formatAddress,
  formatOfferBadge,
  formatPromoWindow,
} from "@/lib/format";

export function OfferRow({ offer }: { offer: OfferWithBusiness }) {
  return (
    <Link
      href={`/offers/${offer.id}`}
      className="group block border-b border-[var(--line)] py-5 transition hover:bg-white/50"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-muted">
            <span className="rounded-full bg-mist px-2.5 py-1 text-pine">
              {CATEGORY_LABELS[offer.category]}
            </span>
            <span>{offer.region_name}</span>
            <span className="text-honey">{formatOfferBadge(offer)}</span>
          </div>
          <h3 className="font-display text-2xl text-pine transition group-hover:text-moss">
            {offer.business_name}
          </h3>
          <p className="mt-1 text-base font-semibold text-ink">{offer.title}</p>
          <p className="mt-2 line-clamp-2 text-sm text-muted">
            {offer.description}
          </p>
          <p className="mt-3 text-sm text-muted">{formatAddress(offer)}</p>
        </div>
        <div className="shrink-0 text-sm font-semibold text-pine sm:text-right">
          <p>{formatPromoWindow(offer.starts_at, offer.ends_at)}</p>
          {offer.verified_at ? (
            <p className="mt-1 text-xs font-medium text-muted">
              Verified {offer.verified_at}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
