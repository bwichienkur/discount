import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { OfferForm } from "@/components/OfferForm";
import type { Offer } from "@/lib/types";

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const offer = getDb()
    .prepare("SELECT * FROM offers WHERE id = ?")
    .get(Number(id)) as Offer | undefined;
  if (!offer) notFound();

  const businesses = getDb()
    .prepare("SELECT id, name FROM businesses ORDER BY name ASC")
    .all() as { id: number; name: string }[];

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
