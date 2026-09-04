import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getBusinessById, listRegions } from "@/lib/db";
import { BusinessForm } from "@/components/BusinessForm";

export const dynamic = "force-dynamic";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const business = getBusinessById(Number(id));
  if (!business) notFound();
  const regions = listRegions();

  return (
    <main className="site-shell py-10">
      <Link href="/admin" className="text-sm font-bold text-moss">
        ← Admin
      </Link>
      <h1 className="mt-3 font-display text-4xl text-pine">Edit business</h1>
      <BusinessForm regions={regions} initial={business} />
    </main>
  );
}
