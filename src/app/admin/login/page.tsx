"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "same-origin",
    });
    setLoading(false);
    if (!res.ok) {
      setError("Incorrect password");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <main className="site-shell flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-8 shadow-[0_20px_50px_rgba(15,47,38,0.08)]">
        <Link href="/" className="font-display text-2xl text-pine">
          Open Door GA
        </Link>
        <h1 className="mt-4 font-display text-3xl text-pine">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the admin password to manage businesses and offers.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
