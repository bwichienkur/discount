import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getOfferRecord, listBusinesses } from "@/lib/db";
import { OfferForm } from "@/components/OfferForm";

export const dynamic = "force-dynamic";

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const offer = getOfferRecord(Number(id));
  if (!offer) notFound();

  const businesses = listBusinesses().map((b) => ({ id: b.id, name: b.name }));

  return (
    <main className="site-shell py-10">
      <Link href="/admin" className="text-sm font-bold text-moss">
        ← Admin
      </Link>
      <h1 className="mt-3 font-display text-4xl text-pine">Edit offer</h1>
      <OfferForm businesses={businesses} initial={offer} />
    </main>
  );
}
