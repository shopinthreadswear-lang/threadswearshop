import Link from "next/link";
import type { OrderStatus } from "@/lib/types";
import { fmtDate, OPEN_STATUSES, STATUS_LABEL } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { formatINR } from "@/lib/site";
import { Card, Empty, OrderPill, PageHeader, Tabs, td, th } from "@/components/admin/bits";

export const metadata = { title: "Orders" };

const FILTERS: { key: string; label: string; match: (s: OrderStatus) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "open", label: "To fulfil", match: (s) => OPEN_STATUSES.includes(s) },
  { key: "transit", label: "On the way", match: (s) => s === "shipped" || s === "out_for_delivery" },
  { key: "delivered", label: "Delivered", match: (s) => s === "delivered" },
  { key: "closed", label: "Cancelled & returned", match: (s) => s === "cancelled" || s === "returned" },
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams;
  const orders = await read((db) => [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  const filter = FILTERS.find((f) => f.key === status) ?? FILTERS[0];
  const term = q.trim().toLowerCase();
  const shown = orders.filter((o) => filter.match(o.status) && (!term || [o.id, o.email, o.phone, o.shippingAddress.fullName].some((x) => x?.toLowerCase().includes(term))));
  const href = (k: string) => `/admin/orders?status=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <>
      <PageHeader title="Orders" sub="Search, then open an order to pack, ship or cancel it." />
      <form className="mb-4 flex gap-2" role="search">
        <input type="hidden" name="status" value={filter.key} />
        <label htmlFor="q" className="sr-only">Search orders</label>
        <input id="q" name="q" defaultValue={q} placeholder="Order number, name, email or phone" className="field h-11 min-w-0 max-w-md flex-1 rounded-full px-5" />
        <button className="btn btn-outline btn-sm">Search</button>
      </form>
      <Tabs current={filter.key} items={FILTERS.map((f) => ({ key: f.key, label: f.label, href: href(f.key), count: orders.filter((o) => f.match(o.status)).length }))} />

      <Card pad={false}>
        {shown.length ? (
          <>
            {/* Phones: cards */}
            <ul className="divide-y divide-line md:hidden">
              {shown.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-4 py-4 active:bg-bone">
                    <span className="min-w-0">
                      <span className="block font-bold text-ink">{o.id}</span>
                      <span className="block truncate text-[12.5px] text-muted">{o.shippingAddress.fullName} · {fmtDate(o.createdAt)}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-[13.5px] font-semibold">{formatINR(o.totals.total)}</span>
                      <OrderPill status={o.status} label={STATUS_LABEL[o.status]} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {/* Larger screens: table */}
            <table className="hidden w-full md:table">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Date</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Items</th>
                  <th className={th}>Payment</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-bone/60">
                    <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-bold text-ink hover:text-burgundy">{o.id}</Link></td>
                    <td className={`${td} whitespace-nowrap text-muted`}>{fmtDate(o.createdAt)}</td>
                    <td className={td}>
                      <span className="block font-semibold">{o.shippingAddress.fullName}</span>
                      <span className="block text-[12px] text-muted">{o.email}</span>
                    </td>
                    <td className={`${td} text-muted`}>{o.items.reduce((a, i) => a + i.quantity, 0)}</td>
                    <td className={`${td} text-muted`}>{o.payment.status === "cod" ? "Cash on delivery" : o.payment.status === "paid" ? "Paid" : "Pending"}</td>
                    <td className={td}><OrderPill status={o.status} label={STATUS_LABEL[o.status]} /></td>
                    <td className={`${td} text-right font-semibold`}>{formatINR(o.totals.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <Empty title={term ? `No orders match “${q}”` : "No orders here"}>{term ? "Try the order number (like TW-482913) or the customer’s email." : "Orders in this state will show up here."}</Empty>
        )}
      </Card>
    </>
  );
}
