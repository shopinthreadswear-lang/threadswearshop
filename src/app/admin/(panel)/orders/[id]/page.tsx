import Image from "next/image";
import { getAdmin } from "@/lib/server/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fmtDate, nextStatuses, STATUS_LABEL } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { formatINR } from "@/lib/site";
import { Card, OrderPill, PageHeader } from "@/components/admin/bits";
import { OrderActions } from "./OrderActions";
import { RefundForm } from "./RefundForm";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await getAdmin("orders");
  const { id } = await params;
  const order = await read((db) => db.orders.find((o) => o.id === id));
  if (!order) notFound();
  const a = order.shippingAddress;
  const next = nextStatuses(order.status);
  const refunded = (order.refunds ?? []).reduce((x, r) => x + r.amount, 0);
  const left = order.totals.total - refunded;
  const refundable = left > 0 && (order.payment.status === "paid" || (order.payment.status === "cod" && (order.status === "delivered" || order.status === "returned")));

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={order.id}
        sub={<>Placed {fmtDate(order.createdAt, true)} · <OrderPill status={order.status} label={STATUS_LABEL[order.status]} />{refunded ? <> · <span className="font-semibold text-error">Refunded {formatINR(refunded)}</span></> : null}</>}
        action={<Link href={`/admin/invoice/${order.id}`} target="_blank" className="btn btn-outline btn-sm">Invoice / PDF</Link>}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card title={`Items (${order.items.reduce((s, i) => s + i.quantity, 0)})`}>
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.sku} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="relative h-16 w-13 shrink-0 overflow-hidden rounded-[10px] bg-bone">
                    <Image src={i.image} alt="" fill sizes="52px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link href={`/products/${i.slug}`} target="_blank" className="block truncate text-[14px] font-semibold text-ink hover:text-burgundy">{i.name}</Link>
                    <span className="block text-[12.5px] text-muted">{i.color} · {i.size} · SKU {i.sku}</span>
                  </span>
                  <span className="shrink-0 text-right text-[13.5px]">
                    <span className="block font-semibold">{formatINR(i.lineTotal)}</span>
                    <span className="block text-[12px] text-muted">{i.quantity} × {formatINR(i.unitPrice)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[13.5px]">
              {[
                ["Subtotal", formatINR(order.totals.subtotal)],
                ...(order.totals.discount ? [[`Discount${order.promoCode ? ` (${order.promoCode})` : ""}`, `−${formatINR(order.totals.discount)}`]] : []),
                ["Shipping", order.totals.shipping ? formatINR(order.totals.shipping) : "Free"],
                ...(order.totals.codFee ? [["COD fee", formatINR(order.totals.codFee)]] : []),
                ["GST included", formatINR(order.totals.tax)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>
              ))}
              <div className="flex justify-between border-t border-line pt-3 text-[15px] font-bold"><dt>Total</dt><dd>{formatINR(order.totals.total)}</dd></div>
              {refunded > 0 && <div className="flex justify-between text-error"><dt>Refunded</dt><dd>−{formatINR(refunded)}</dd></div>}
            </dl>
          </Card>

          <Card title="History">
            <ol className="relative space-y-4 border-l-2 border-line pl-5">
              {[...order.timeline].reverse().map((t, n) => (
                <li key={n} className="relative">
                  <span aria-hidden className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-paper ${n === 0 ? "bg-burgundy" : "bg-beige"}`} />
                  <p className="text-[13.5px] font-semibold text-ink">{STATUS_LABEL[t.status]}</p>
                  <p className="text-[12.5px] text-muted">{fmtDate(t.at, true)}{t.note ? ` · ${t.note}` : ""}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Next step">
            {next.length ? <OrderActions orderId={order.id} next={next.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} courier={order.courier} /> : <p className="text-[13.5px] text-muted">This order is {STATUS_LABEL[order.status].toLowerCase()}. Nothing more to do.</p>}
          </Card>
          <Card title="Refund">
            {(order.refunds ?? []).length > 0 && (
              <ul className="mb-4 space-y-2">
                {order.refunds!.map((r) => (
                  <li key={r.id} className="rounded-chip bg-bone px-3 py-2 text-[12.5px]">
                    <span className="font-semibold text-ink">{formatINR(r.amount)}</span> · {r.reason}
                    <span className="block text-muted">{fmtDate(r.at, true)} · by {r.by}{r.restocked ? " · restocked" : ""}</span>
                  </li>
                ))}
              </ul>
            )}
            {refundable ? (
              <RefundForm orderId={order.id} left={left} canRestock={order.status !== "cancelled" && !(order.refunds ?? []).some((r) => r.restocked)} />
            ) : (
              <p className="text-[13px] text-muted">{left <= 0 ? "Fully refunded." : order.payment.status === "pending" ? "Not paid yet, so nothing to refund." : "Cash on delivery: refunds open once the order is delivered."}</p>
            )}
          </Card>
          <Card title="Customer">
            <p className="text-[14px] font-semibold">{a.fullName}</p>
            <p className="mt-1 text-[13.5px]"><a href={`mailto:${order.email}`} className="text-burgundy hover:underline">{order.email}</a></p>
            <p className="text-[13.5px]"><a href={`tel:${order.phone}`} className="text-burgundy hover:underline">{order.phone}</a></p>
            <p className="mt-2 text-[12.5px] text-muted">{order.userId ? <Link href={`/admin/customers/${order.userId}`} className="font-semibold text-burgundy hover:underline">View customer →</Link> : "Checked out as a guest"}</p>
          </Card>
          <Card title="Ship to">
            <address className="text-[13.5px] not-italic leading-relaxed text-ink">
              {a.fullName}<br />{a.line1}{a.line2 ? <><br />{a.line2}</> : null}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}
            </address>
            <p className="mt-3 text-[12.5px] text-muted">{order.delivery.label} · {order.delivery.eta}</p>
            {order.courier && <p className="mt-1 text-[12.5px] text-muted">{order.courier.name} · {order.courier.trackingId}</p>}
          </Card>
          <Card title="Payment">
            <p className="text-[13.5px]">{order.payment.label}</p>
            <p className="mt-1 text-[12.5px] text-muted">{order.payment.status === "cod" ? "Collect cash on delivery" : order.payment.status === "paid" ? "Paid" : "Payment pending"}{order.payment.reference ? ` · Ref ${order.payment.reference}` : ""}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
