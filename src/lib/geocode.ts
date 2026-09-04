/** Geocode a Georgia address via OpenStreetMap Nominatim (no API key). */
export async function geocodeGeorgiaAddress(parts: {
  address_line1: string;
  city: string;
  state: string;
  zip: string;
}): Promise<{ lat: number; lng: number } | null> {
  const query = `${parts.address_line1}, ${parts.city}, ${parts.state} ${parts.zip}, USA`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "OpenDoorGA/1.0 (foster-family-directory; contact@localhost)",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data[0]) return null;
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
  } catch {
    return null;
  }
}
