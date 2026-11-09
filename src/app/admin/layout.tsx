import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin, OPEN_STATUSES } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin | Threads Ware" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();

  if (!admin)
    return (
      <main id="main" className="grid min-h-svh place-items-center bg-ivory px-4">
        <div className="max-w-md text-center">
          <p className="font-serif text-[22px] font-extrabold text-ink">This area is for the Threads Ware team</p>
          <p className="mt-2 text-[14px] text-muted">You’re signed in, but your account doesn’t have admin access. Ask the store owner to add your email to the admin list.</p>
          <Link href="/" className="btn btn-primary btn-sm mt-6">
            Back to the shop
          </Link>
        </div>
      </main>
    );

  const badges = await read((db) => ({
    "/admin/orders": db.orders.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    "/admin/returns": db.returns.filter((r) => r.status === "requested").length,
    "/admin/inbox": db.contactMessages.filter((m) => Date.now() - new Date(m.createdAt).getTime() < 7 * 864e5).length,
  }));

  return (
    <div className="min-h-svh bg-ivory">
      <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/admin" className="flex min-w-0 items-baseline gap-2 whitespace-nowrap">
            <span className="font-serif text-[16px] font-black uppercase italic sm:text-[18px] tracking-[-0.04em] text-burgundy">Threads Ware</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted sm:text-[12px]">Admin</span>
          </Link>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden text-[13px] text-muted sm:inline">{admin.firstName}</span>
            <Link href="/" className="inline-flex h-10 items-center whitespace-nowrap rounded-full border border-line px-3.5 text-[13px] font-semibold sm:px-4 text-ink transition-colors hover:border-burgundy hover:text-burgundy">
              View shop ↗
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pb-20 pt-5 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:pt-8">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <AdminNav badges={badges} />
        </aside>
        <main id="main" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
