import Link from "next/link";

export function SiteHeader({
  variant = "default",
}: {
  variant?: "default" | "transparent";
}) {
  const transparent = variant === "transparent";
  return (
    <header
      className={`relative z-20 ${transparent ? "text-white" : "text-ink"}`}
    >
      <div className="site-shell flex items-center justify-between gap-4 py-5">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight sm:text-3xl">
            Open Door{" "}
            <span className={transparent ? "text-[#d9efe4]" : "text-moss"}>
              GA
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold sm:gap-3">
          <Link
            href="/explore"
            className={`rounded-full px-3 py-2 transition hover:opacity-80 ${
              transparent ? "text-white/90" : "text-pine"
            }`}
          >
            Explore
          </Link>
          <Link
            href="/admin"
            className={`rounded-full px-3 py-2 transition hover:opacity-80 ${
              transparent ? "text-white/75" : "text-muted"
            }`}
          >
            Admin
          </Link>
          <Link href="/explore" className="btn btn-primary !py-2.5 !px-4 text-sm">
            Find offers
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] py-10 text-sm text-muted">
      <div className="site-shell flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xl text-pine">Open Door GA</p>
          <p className="mt-1 max-w-xl">
            A curated Georgia directory of free and discounted experiences for
            foster and kinship families. Offers are manually verified — always
            confirm details with the venue.
          </p>
        </div>
        <p>Built for Georgia · Regions filter-ready</p>
      </div>
    </footer>
  );
}
