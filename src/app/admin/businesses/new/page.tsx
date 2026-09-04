import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { listRegions } from "@/lib/db";
import { BusinessForm } from "@/components/BusinessForm";

export default async function NewBusinessPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const regions = listRegions();

  return (
    <main className="site-shell py-10">
      <Link href="/admin" className="text-sm font-bold text-moss">
        ← Admin
      </Link>
      <h1 className="mt-3 font-display text-4xl text-pine">Add business</h1>
      <BusinessForm regions={regions} />
    </main>
  );
}
