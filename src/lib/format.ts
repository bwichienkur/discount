import { format, parseISO, isValid } from "date-fns";
import type { OfferWithBusiness } from "./types";

export function formatOfferBadge(offer: Pick<OfferWithBusiness, "is_free" | "discount_percent" | "discount_details">) {
  if (offer.is_free) return "Free";
  if (offer.discount_percent != null) return `${offer.discount_percent}% off`;
  if (offer.discount_details) return offer.discount_details;
  return "Special offer";
}

export function formatAddress(offer: Pick<OfferWithBusiness, "address_line1" | "address_line2" | "city" | "state" | "zip">) {
  const line2 = offer.address_line2 ? `, ${offer.address_line2}` : "";
  return `${offer.address_line1}${line2}, ${offer.city}, ${offer.state} ${offer.zip}`;
}

export function formatDateLabel(value: string | null | undefined) {
  if (!value) return null;
  try {
    const d = parseISO(value.length === 10 ? `${value}T00:00:00` : value);
    if (!isValid(d)) return value;
    return format(d, "MMM d, yyyy");
  } catch {
    return value;
  }
}

export function formatPromoWindow(startsAt: string | null, endsAt: string | null) {
  if (!startsAt && !endsAt) return "Ongoing";
  const start = formatDateLabel(startsAt);
  const end = formatDateLabel(endsAt);
  if (start && end) return `${start} – ${end}`;
  if (start) return `From ${start}`;
  if (end) return `Through ${end}`;
  return "Ongoing";
}
