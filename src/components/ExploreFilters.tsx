"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { CATEGORIES } from "@/lib/types";

export function ExploreFilters({
  regions,
}: {
  regions: { id: number; name: string; slug: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.push(`/explore?${next.toString()}`);
    });
  }

  return (
    <form
      className={`grid gap-3 rounded-[1.25rem] border border-[var(--line)] bg-white/80 p-4 shadow-[0_12px_40px_rgba(15,47,38,0.05)] sm:grid-cols-2 lg:grid-cols-4 ${
        pending ? "opacity-70" : ""
      }`}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="field">
        <label htmlFor="q">Search</label>
        <input
          id="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="Business, city, offer…"
          onChange={(e) => update("q", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="region">Region</label>
        <select
          id="region"
          defaultValue={params.get("region") ?? ""}
          onChange={(e) => update("region", e.target.value)}
        >
          <option value="">All Georgia</option>
          {regions.map((r) => (
            <option key={r.id} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          defaultValue={params.get("category") ?? ""}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="free">Offer type</label>
        <select
          id="free"
          defaultValue={params.get("free") ?? ""}
          onChange={(e) => update("free", e.target.value)}
        >
          <option value="">Free & discounted</option>
          <option value="1">Free only</option>
        </select>
      </div>
    </form>
  );
}
