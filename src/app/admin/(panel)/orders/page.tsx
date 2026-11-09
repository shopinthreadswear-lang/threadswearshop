import Link from "next/link";
import { getAdmin } from "@/lib/server/admin";
import type { Order, OrderStatus } from "@/lib/types";
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

const PAYMENTS: Record<string, { label: string; match: (o: Order) => boolean }> = {
  paid: { label: "Paid online", match: (o) => o.payment.status === "paid" },
  cod: { label: "Cash on delivery", match: (o) => o.payment.status === "cod" },
  pending: { label: "Payment pending", match: (o) => o.payment.status === "pending" },
  refunded: { label: "Refunded", match: (o) => !!o.refunds?.length },
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; pay?: string; from?: string; to?: string }> }) {
  await getAdmin("orders");
  const { status = "all", q = "", pay = "", from = "", to = "" } = await searchParams;
  const fromT = from ? new Date(`${from}T00:00:00+05:30`).getTime() : -Infinity;
  const toT = to ? new Date(`${to}T23:59:59.999+05:30`).getTime() : Infinity;
  const orders = await read((db) => [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  const filter = FILTERS.find((f) => f.key === status) ?? FILTERS[0];
  const term = q.trim().toLowerCase();
  const inRange = (o: Order) => {
    const t = new Date(o.createdAt).getTime();
    return t >= fromT && t <= toT && (!PAYMENTS[pay] || PAYMENTS[pay].match(o));
  };
  const scoped = orders.filter(inRange);
  const shown = scoped.filter((o) => filter.match(o.status) && (!term || [o.id, o.email, o.phone, o.shippingAddress.fullName].some((x) => x?.toLowerCase().includes(term))));
  const keep = new URLSearchParams({ ...(q ? { q } : {}), ...(pay ? { pay } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) });
  const href = (k: string) => `/admin/orders?status=${k}${keep.size ? `&${keep}` : ""}`;
  const filtered = !!(pay || from || to);
  const sum = shown.reduce((a, o) => a + o.totals.total, 0);

  return (
    <>
      <PageHeader title="Orders" sub="Search, then open an order to pack, ship or cancel it." />
      <form className="mb-4 flex flex-wrap items-end gap-2" role="search">
        <input type="hidden" name="status" value={filter.key} />
        <div className="min-w-0 flex-[1_1_260px]">
          <label htmlFor="q" className="sr-only">Search orders</label>
          <input id="q" name="q" defaultValue={q} placeholder="Order number, name, email or phone" className="field h-11 w-full rounded-full px-5" />
        </div>
        <div>
          <label htmlFor="pay" className="mb-1 block text-[11.5px] font-bold text-muted">Payment</label>
          <select id="pay" name="pay" defaultValue={pay} className="field h-11 rounded-full px-4">
            <option value="">Any</option>
            {Object.entries(PAYMENTS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="mb-1 block text-[11.5px] font-bold text-muted">From</label>
          <input id="from" name="from" type="date" defaultValue={from} className="field h-11 rounded-full px-4" />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-[11.5px] font-bold text-muted">To</label>
          <input id="to" name="to" type="date" defaultValue={to} className="field h-11 rounded-full px-4" />
        </div>
        <button className="btn btn-outline btn-sm h-11">Apply</button>
        {(filtered || q) && <Link href={`/admin/orders?status=${filter.key}`} className="inline-flex h-11 items-center px-2 text-[13px] font-semibold text-muted hover:text-burgundy">Clear</Link>}
      </form>
      <Tabs current={filter.key} items={FILTERS.map((f) => ({ key: f.key, label: f.label, href: href(f.key), count: scoped.filter((o) => f.match(o.status)).length }))} />
      {shown.length > 0 && <p className="-mt-2 mb-3 text-[12.5px] text-muted">{shown.length} {shown.length === 1 ? "order" : "orders"} · {formatINR(sum)} in total</p>}

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
                    <td className={`${td} text-muted`}>{o.payment.status === "cod" ? "Cash on delivery" : o.payment.status === "paid" ? "Paid" : "Pending"}{o.refunds?.length ? <span className="block text-[12px] font-semibold text-error">Refunded</span> : null}</td>
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
