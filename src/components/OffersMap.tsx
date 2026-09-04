"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { OfferWithBusiness } from "@/lib/types";
import { formatOfferBadge } from "@/lib/format";

const georgiaCenter: [number, number] = [32.65, -83.5];

function pinIcon(isFree: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="offer-pin" style="background:${isFree ? "#c9852c" : "#1a4a3a"}">${isFree ? "F" : "%"}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function OffersMap({ offers }: { offers: OfferWithBusiness[] }) {
  const mapped = useMemo(
    () => offers.filter((o) => o.lat != null && o.lng != null),
    [offers],
  );

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-white shadow-[0_20px_50px_rgba(15,47,38,0.08)] sm:h-[560px]">
      <MapContainer
        center={georgiaCenter}
        zoom={7}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapped.map((offer) => (
          <Marker
            key={offer.id}
            position={[offer.lat as number, offer.lng as number]}
            icon={pinIcon(Boolean(offer.is_free))}
          >
            <Popup>
              <div className="min-w-[160px] space-y-1">
                <p className="font-bold text-pine">{offer.business_name}</p>
                <p className="text-sm">{offer.title}</p>
                <p className="text-xs font-semibold text-honey">
                  {formatOfferBadge(offer)}
                </p>
                <Link
                  href={`/offers/${offer.id}`}
                  className="text-sm font-semibold text-moss underline"
                >
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
