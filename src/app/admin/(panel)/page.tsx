import Link from "next/link";
import { getAdmin } from "@/lib/server/admin";
import Image from "next/image";
import { dashboard, fmtDate, ROLE_LABEL, STATUS_LABEL } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { formatINR } from "@/lib/site";
import { Card, Empty, OrderPill, PageHeader, Pill, Stat, td, th } from "@/components/admin/bits";

export const metadata = { title: "Overview" };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const me = await getAdmin("dashboard");
  const { denied } = await searchParams;
  const d = await read(dashboard);
  const max = Math.max(1, ...d.days.map((x) => x.total));
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      {denied && <p role="alert" className="mb-4 rounded-chip bg-error/10 px-4 py-3 text-[13px] font-medium text-error">Your role ({ROLE_LABEL[me.role]}) doesn’t include that page. Ask the owner if you need access.</p>}
      <PageHeader title={me.role === "owner" ? greeting : `${greeting}, ${me.name.split(" ")[0]}`} sub={d.toFulfil ? `${d.toFulfil} ${d.toFulfil === 1 ? "order is" : "orders are"} waiting to be packed and shipped.` : "Every order is on its way. Nothing waiting on you."} action={d.toFulfil ? <Link href="/admin/orders?status=open" className="btn btn-primary btn-sm">Fulfil orders</Link> : undefined} />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat label="Sales, last 30 days" value={formatINR(d.revenue30)} note={`${formatINR(d.revenue)} all time`} />
        <Stat label="Orders" value={String(d.orders)} note={`Average ${formatINR(d.aov)}`} href="/admin/orders" />
        <Stat label="Customers" value={String(d.customers)} note={`${d.newCustomers} new this month`} href="/admin/customers" />
        <Stat label="Low or sold out" value={String(d.lowVariants.length)} note="sizes to restock" href="/admin/products?stock=low" />
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Sales, last 14 days">
          <div className="flex h-40 items-end gap-1.5" role="img" aria-label={`Daily sales for the last 14 days, highest ${formatINR(max)}`}>
            {d.days.map((x) => (
              <div key={x.date} className="group relative flex h-full flex-1 flex-col justify-end">
                <div className="rounded-t-[6px] bg-burgundy/85 transition-colors group-hover:bg-burgundy" style={{ height: `${Math.max(x.total ? 6 : 2, (x.total / max) * 100)}%`, opacity: x.total ? 1 : 0.25 }} />
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-1 text-[11px] font-semibold text-cream opacity-0 transition-opacity group-hover:opacity-100">
                  {formatINR(x.total)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11.5px] text-muted">
            <span>{fmtDate(d.days[0].date)}</span>
            <span>Today</span>
          </div>
        </Card>

        <Card title="Needs attention">
          <ul className="space-y-1 text-[13.5px]">
            {[
              [d.toFulfil, "orders to pack and ship", "/admin/orders?status=open"],
              [d.openReturns, "returns in progress", "/admin/returns"],
              [d.newMessages, "messages this week", "/admin/inbox"],
              [d.lowVariants.filter((v) => v.available === 0).length, "sizes sold out", "/admin/products?stock=out"],
            ].map(([n, label, href]) => (
              <li key={href as string}>
                <Link href={href as string} className="flex items-center justify-between rounded-chip px-3 py-2.5 transition-colors hover:bg-bone">
                  <span>
                    <b className="font-bold text-ink">{n as number}</b> <span className="text-muted">{label as string}</span>
                  </span>
                  <span aria-hidden className="text-muted">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Latest orders" action={<Link href="/admin/orders" className="text-[13px] font-semibold text-burgundy hover:underline">All orders</Link>} pad={false}>
          {d.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="border-y border-line">
                  <tr>
                    <th className={th}>Order</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Status</th>
                    <th className={`${th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {d.recentOrders.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-bone/60">
                      <td className={td}>
                        <Link href={`/admin/orders/${o.id}`} className="font-bold text-ink hover:text-burgundy">{o.id}</Link>
                        <span className="block text-[12px] text-muted">{fmtDate(o.createdAt)}</span>
                      </td>
                      <td className={`${td} max-w-[200px] truncate text-muted`}>{o.shippingAddress.fullName}</td>
                      <td className={td}><OrderPill status={o.status} label={STATUS_LABEL[o.status]} /></td>
                      <td className={`${td} text-right font-semibold`}>{formatINR(o.totals.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No orders yet">They’ll appear here the moment a customer checks out.</Empty>
          )}
        </Card>

        <Card title="Best sellers">
          {d.topProducts.length ? (
            <ol className="space-y-3">
              {d.topProducts.map((p, i) => (
                <li key={p.slug} className="flex items-center justify-between gap-3 text-[13.5px]">
                  <span className="min-w-0 truncate"><span className="mr-2 font-bold text-muted">{i + 1}</span>{p.name.replace(/^The /, "")}</span>
                  <span className="shrink-0 text-muted">{p.units} sold</span>
                </li>
              ))}
            </ol>
          ) : (
            <Empty title="No sales yet" />
          )}
        </Card>
      </div>

      <Card title="Running low" className="mt-4" action={<Link href="/admin/products?stock=low" className="text-[13px] font-semibold text-burgundy hover:underline">Restock</Link>}>
        {d.lowVariants.length ? (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {d.lowVariants.slice(0, 9).map((v) => (
              <li key={v.sku}>
                <Link href={`/admin/products/${v.product.id}#stock`} className="flex items-center gap-3 rounded-chip border border-line bg-ivory p-2.5 transition-colors hover:border-burgundy">
                  <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-[8px] bg-bone">
                    <Image src={v.product.images[0]} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">{v.product.name.replace(/^The /, "")}</span>
                    <span className="block text-[12px] text-muted">{v.color} · {v.size}</span>
                  </span>
                  {v.available === 0 ? <Pill tone="bad">Sold out</Pill> : <Pill tone="new">{v.available} left</Pill>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="Every size is well stocked" />
        )}
      </Card>
    </>
  );
}
