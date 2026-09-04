"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, type Business, type Category } from "@/lib/types";

type Region = { id: number; name: string; slug: string };

export function BusinessForm({
  regions,
  initial,
}: {
  regions: Region[];
  initial?: Business;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      category: String(form.get("category") || "") as Category,
      region_id: Number(form.get("region_id")),
      address_line1: String(form.get("address_line1") || ""),
      address_line2: String(form.get("address_line2") || "") || null,
      city: String(form.get("city") || ""),
      state: String(form.get("state") || "GA"),
      zip: String(form.get("zip") || ""),
      lat: form.get("lat") ? Number(form.get("lat")) : null,
      lng: form.get("lng") ? Number(form.get("lng")) : null,
      phone: String(form.get("phone") || "") || null,
      website: String(form.get("website") || "") || null,
      active: form.get("active") === "on",
    };

    const res = await fetch(
      initial ? `/api/businesses/${initial.id}` : "/api/businesses",
      {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ? JSON.stringify(data.error) : "Save failed");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function onDelete() {
    if (!initial) return;
    if (!confirm("Delete this business and its offers?")) return;
    await fetch(`/api/businesses/${initial.id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
      <div className="field sm:col-span-2">
        <label htmlFor="name">Business name</label>
        <input id="name" name="name" required defaultValue={initial?.name} />
      </div>
      <div className="field">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          required
          defaultValue={initial?.category ?? "restaurant"}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="region_id">Region</label>
        <select
          id="region_id"
          name="region_id"
          required
          defaultValue={initial?.region_id ?? regions[0]?.id}
        >
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field sm:col-span-2">
        <label htmlFor="address_line1">Address</label>
        <input
          id="address_line1"
          name="address_line1"
          required
          defaultValue={initial?.address_line1}
        />
      </div>
      <div className="field sm:col-span-2">
        <label htmlFor="address_line2">Address line 2</label>
        <input
          id="address_line2"
          name="address_line2"
          defaultValue={initial?.address_line2 ?? ""}
        />
      </div>
      <div className="field">
        <label htmlFor="city">City</label>
        <input id="city" name="city" required defaultValue={initial?.city} />
      </div>
      <div className="field">
        <label htmlFor="state">State</label>
        <input id="state" name="state" required defaultValue={initial?.state ?? "GA"} />
      </div>
      <div className="field">
        <label htmlFor="zip">ZIP</label>
        <input id="zip" name="zip" required defaultValue={initial?.zip} />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
      </div>
      <div className="field sm:col-span-2">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="url"
          placeholder="https://"
          defaultValue={initial?.website ?? ""}
        />
      </div>
      <div className="field">
        <label htmlFor="lat">Latitude (optional)</label>
        <input
          id="lat"
          name="lat"
          type="number"
          step="any"
          defaultValue={initial?.lat ?? ""}
        />
      </div>
      <div className="field">
        <label htmlFor="lng">Longitude (optional)</label>
        <input
          id="lng"
          name="lng"
          type="number"
          step="any"
          defaultValue={initial?.lng ?? ""}
        />
      </div>
      <p className="sm:col-span-2 text-sm text-muted">
        Leave lat/lng blank to auto-geocode via OpenStreetMap Nominatim when
        saving.
      </p>
      <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial ? Boolean(initial.active) : true}
        />
        Active / visible
      </label>
      {error ? (
        <p className="sm:col-span-2 text-sm font-semibold text-red-700">{error}</p>
      ) : null}
      <div className="sm:col-span-2 flex flex-wrap gap-3">
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save business"}
        </button>
        <Link href="/admin" className="btn btn-ghost">
          Cancel
        </Link>
        {initial ? (
          <button
            type="button"
            onClick={onDelete}
            className="btn btn-ghost text-red-700"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
