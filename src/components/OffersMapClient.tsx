"use client";

import dynamic from "next/dynamic";
import type { OfferWithBusiness } from "@/lib/types";

const OffersMap = dynamic(
  () => import("./OffersMap").then((m) => m.OffersMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[420px] place-items-center rounded-[1.25rem] border border-[var(--line)] bg-white/70 text-muted sm:h-[560px]">
        Loading map…
      </div>
    ),
  },
);

export function OffersMapClient({ offers }: { offers: OfferWithBusiness[] }) {
  return <OffersMap offers={offers} />;
}
