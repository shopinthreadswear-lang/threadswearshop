import Link from "next/link";
import { can, getAdmin, OPEN_STATUSES, ROLE_LABEL, type Area } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { AdminNav } from "@/components/admin/AdminNav";
import { adminLogout } from "../login/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();

  const AREAS: Area[] = ["dashboard", "orders", "returns", "customers", "inbox", "reviews", "products", "content", "offers", "coupons", "settings", "team", "activity"];
  const allowed = AREAS.filter((a) => can(admin, a));
  const badges = await read((db) => ({
    "/admin/orders": db.orders.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    "/admin/returns": db.returns.filter((r) => r.status === "requested").length,
    "/admin/reviews": db.reviews.filter((r) => r.status === "pending").length,
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
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[240px] truncate text-[13px] text-muted md:inline" title={admin.email}>
              {admin.role === "owner" ? <span className="font-semibold text-ink">Owner</span> : <>{admin.name} · <span className="font-semibold text-ink">{ROLE_LABEL[admin.role]}</span></>}
            </span>
            <Link href="/" className="inline-flex h-10 items-center whitespace-nowrap rounded-full border border-line px-3.5 text-[13px] font-semibold sm:px-4 text-ink transition-colors hover:border-burgundy hover:text-burgundy">
              View shop ↗
            </Link>
            <form action={adminLogout}>
              <button type="submit" className="inline-flex h-10 items-center whitespace-nowrap rounded-full bg-burgundy px-3.5 text-[13px] font-semibold text-cream sm:px-4">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pb-20 pt-5 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:pt-8">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <AdminNav badges={badges} allowed={allowed} />
        </aside>
        <main id="main" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
