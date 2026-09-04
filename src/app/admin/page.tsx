import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb, listRegions } from "@/lib/db";
import { LogoutButton } from "@/components/LogoutButton";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const regions = listRegions();
  const businesses = getDb()
    .prepare(
      `
      SELECT b.*, r.name AS region_name
      FROM businesses b
      JOIN regions r ON r.id = b.region_id
      ORDER BY b.name ASC
    `,
    )
    .all() as Array<{
    id: number;
    name: string;
    category: Category;
    city: string;
    region_name: string;
    active: number;
  }>;

  const offers = getDb()
    .prepare(
      `
      SELECT o.id, o.title, o.is_free, o.discount_percent, o.active, o.ends_at,
             b.name AS business_name
      FROM offers o
      JOIN businesses b ON b.id = o.business_id
      ORDER BY o.updated_at DESC
    `,
    )
    .all() as Array<{
    id: number;
    title: string;
    is_free: number;
    discount_percent: number | null;
    active: number;
    ends_at: string | null;
    business_name: string;
  }>;

  return (
    <main className="site-shell py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="font-display text-2xl text-pine">
            Open Door GA
          </Link>
          <h1 className="mt-2 font-display text-4xl text-pine">Admin</h1>
          <p className="mt-1 text-muted">
            Manually curate Georgia businesses and foster-family offers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/explore" className="btn btn-ghost !py-2.5 text-sm">
            View public site
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/businesses/new" className="btn btn-primary !py-2.5 text-sm">
          Add business
        </Link>
        <Link href="/admin/offers/new" className="btn btn-secondary !py-2.5 text-sm">
          Add offer
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-pine">
          Businesses ({businesses.length})
        </h2>
        <div className="mt-4 overflow-x-auto rounded-[1.25rem] border border-[var(--line)] bg-white/80">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] text-xs uppercase tracking-[0.08em] text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id} className="border-b border-[var(--line)]">
                  <td className="px-4 py-3 font-semibold">{b.name}</td>
                  <td className="px-4 py-3">{CATEGORY_LABELS[b.category]}</td>
                  <td className="px-4 py-3">{b.region_name}</td>
                  <td className="px-4 py-3">{b.city}</td>
                  <td className="px-4 py-3">{b.active ? "Active" : "Hidden"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/businesses/${b.id}`}
                      className="font-bold text-moss"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-pine">
          Offers ({offers.length})
        </h2>
        <div className="mt-4 overflow-x-auto rounded-[1.25rem] border border-[var(--line)] bg-white/80">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] text-xs uppercase tracking-[0.08em] text-muted">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Offer</th>
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Ends</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="border-b border-[var(--line)]">
                  <td className="px-4 py-3 font-semibold">{o.business_name}</td>
                  <td className="px-4 py-3">{o.title}</td>
                  <td className="px-4 py-3">
                    {o.is_free
                      ? "Free"
                      : o.discount_percent != null
                        ? `${o.discount_percent}%`
                        : "Special"}
                  </td>
                  <td className="px-4 py-3">{o.ends_at ?? "Ongoing"}</td>
                  <td className="px-4 py-3">{o.active ? "Active" : "Hidden"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/offers/${o.id}`}
                      className="font-bold text-moss"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 mb-8">
        <h2 className="font-display text-2xl text-pine">Regions</h2>
        <p className="mt-2 text-sm text-muted">
          Built-in Georgia regions for filtering (public filters already wired).
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {regions.map((r) => (
            <li
              key={r.id}
              className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-pine"
            >
              {r.name}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
