import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { listBusinesses } from "@/lib/db";
import { OfferForm } from "@/components/OfferForm";

export const dynamic = "force-dynamic";

export default async function NewOfferPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const businesses = listBusinesses().map((b) => ({ id: b.id, name: b.name }));

  return (
    <main className="site-shell py-10">
      <Link href="/admin" className="text-sm font-bold text-moss">
        ← Admin
      </Link>
      <h1 className="mt-3 font-display text-4xl text-pine">Add offer</h1>
      {businesses.length === 0 ? (
        <p className="mt-6 text-muted">
          Add a business first, then create an offer.{" "}
          <Link href="/admin/businesses/new" className="font-bold text-moss">
            Add business
          </Link>
        </p>
      ) : (
        <OfferForm businesses={businesses} />
      )}
    </main>
  );
}
