"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Offer } from "@/lib/types";

type BusinessOption = { id: number; name: string };

export function OfferForm({
  businesses,
  initial,
}: {
  businesses: BusinessOption[];
  initial?: Offer;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(Boolean(initial?.is_free));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      business_id: Number(form.get("business_id")),
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      is_free: form.get("is_free") === "on",
      discount_percent: form.get("discount_percent")
        ? Number(form.get("discount_percent"))
        : null,
      discount_details: String(form.get("discount_details") || "") || null,
      starts_at: String(form.get("starts_at") || "") || null,
      ends_at: String(form.get("ends_at") || "") || null,
      eligibility_notes: String(form.get("eligibility_notes") || "") || null,
      proof_required: String(form.get("proof_required") || "") || null,
      source_url: String(form.get("source_url") || "") || null,
      verified_at: String(form.get("verified_at") || "") || null,
      active: form.get("active") === "on",
    };

    const res = await fetch(
      initial ? `/api/offers/${initial.id}` : "/api/offers",
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
    if (!confirm("Delete this offer?")) return;
    await fetch(`/api/offers/${initial.id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
      <div className="field sm:col-span-2">
        <label htmlFor="business_id">Business</label>
        <select
          id="business_id"
          name="business_id"
          required
          defaultValue={initial?.business_id ?? businesses[0]?.id}
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field sm:col-span-2">
        <label htmlFor="title">Offer title</label>
        <input id="title" name="title" required defaultValue={initial?.title} />
      </div>
      <div className="field sm:col-span-2">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          required
          defaultValue={initial?.description}
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
        <input
          type="checkbox"
          name="is_free"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
        />
        Free admission / free item
      </label>
      {!isFree ? (
        <>
          <div className="field">
            <label htmlFor="discount_percent">Discount %</label>
            <input
              id="discount_percent"
              name="discount_percent"
              type="number"
              min={0}
              max={100}
              step="0.1"
              defaultValue={initial?.discount_percent ?? ""}
            />
          </div>
          <div className="field">
            <label htmlFor="discount_details">Discount details</label>
            <input
              id="discount_details"
              name="discount_details"
              defaultValue={initial?.discount_details ?? ""}
              placeholder="e.g. $10 tickets, BOGO kids meal"
            />
          </div>
        </>
      ) : (
        <input type="hidden" name="discount_details" value={initial?.discount_details ?? ""} />
      )}
      <div className="field">
        <label htmlFor="starts_at">Starts (YYYY-MM-DD)</label>
        <input
          id="starts_at"
          name="starts_at"
          type="date"
          defaultValue={initial?.starts_at?.slice(0, 10) ?? ""}
        />
      </div>
      <div className="field">
        <label htmlFor="ends_at">Ends (YYYY-MM-DD)</label>
        <input
          id="ends_at"
          name="ends_at"
          type="date"
          defaultValue={initial?.ends_at?.slice(0, 10) ?? ""}
        />
      </div>
      <div className="field sm:col-span-2">
        <label htmlFor="eligibility_notes">Eligibility notes</label>
        <textarea
          id="eligibility_notes"
          name="eligibility_notes"
          defaultValue={initial?.eligibility_notes ?? ""}
        />
      </div>
      <div className="field sm:col-span-2">
        <label htmlFor="proof_required">Proof required</label>
        <input
          id="proof_required"
          name="proof_required"
          defaultValue={initial?.proof_required ?? ""}
          placeholder="Foster parent ID, DFCS letter, etc."
        />
      </div>
      <div className="field">
        <label htmlFor="source_url">Source URL</label>
        <input
          id="source_url"
          name="source_url"
          type="url"
          defaultValue={initial?.source_url ?? ""}
        />
      </div>
      <div className="field">
        <label htmlFor="verified_at">Verified date</label>
        <input
          id="verified_at"
          name="verified_at"
          type="date"
          defaultValue={initial?.verified_at?.slice(0, 10) ?? ""}
        />
      </div>
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
          {loading ? "Saving…" : "Save offer"}
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
