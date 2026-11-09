import { notFound } from "next/navigation";
import { fmtDate, getAdmin } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { formatINR, site } from "@/lib/site";
import { PrintButton } from "./PrintButton";

export const metadata = { title: "Invoice" };
export const dynamic = "force-dynamic";

const inr = (n: number) => formatINR(n).replace("₹", "₹ ");

/** Tax invoice for one order. Print it, or "Save as PDF" from the print dialog. */
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await getAdmin("orders");
  const { id } = await params;
  const order = await read((db) => db.orders.find((o) => o.id === id));
  if (!order) notFound();
  const a = order.shippingAddress;
  const t = order.totals;
  const intraState = a.state.trim().toLowerCase() === site.address.state.toLowerCase();
  const refunded = (order.refunds ?? []).reduce((x, r) => x + r.amount, 0);
  const rows: [string, string][] = [
    ["Subtotal", inr(t.subtotal)],
    ...(t.discount ? ([[`Discount${order.promoCode ? ` (${order.promoCode})` : ""}`, `− ${inr(t.discount)}`]] as [string, string][]) : []),
    ["Shipping", t.shipping ? inr(t.shipping) : "Free"],
    ...(t.codFee ? ([["Cash on delivery fee", inr(t.codFee)]] as [string, string][]) : []),
  ];

  return (
    <main className="min-h-svh bg-bone px-4 py-8 text-ink print:bg-white print:p-0">
      <style>{`@page { size: A4; margin: 14mm; } @media print { header, footer, nav, [data-noprint] { display: none !important; } }`}</style>
      <div data-noprint className="mx-auto mb-4 flex max-w-[800px] items-center justify-between gap-3">
        <a href={`/admin/orders/${order.id}`} className="text-[13px] font-semibold text-muted hover:text-burgundy">← Back to order</a>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-[800px] rounded-[16px] bg-white p-8 shadow-card print:rounded-none print:p-0 print:shadow-none sm:p-12">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
          <div>
            <p className="font-serif text-[24px] font-black uppercase italic tracking-[-0.04em] text-burgundy">{site.shortName}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              Threads Ware Private Limited<br />
              {site.address.line1}<br />
              {site.address.line2 && <>{site.address.line2}<br /></>}
              {site.address.city}, {site.address.state} {site.address.pincode}<br />
              GSTIN {site.gstin} · {site.email}
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-[20px] font-extrabold uppercase tracking-[0.06em]">Tax invoice</h1>
            <dl className="mt-2 space-y-0.5 text-[12.5px]">
              <div><dt className="inline text-muted">Invoice no. </dt><dd className="inline font-semibold">INV-{order.id.replace(/^TW-/, "")}</dd></div>
              <div><dt className="inline text-muted">Order </dt><dd className="inline font-semibold">{order.id}</dd></div>
              <div><dt className="inline text-muted">Date </dt><dd className="inline">{fmtDate(order.createdAt)}</dd></div>
              <div><dt className="inline text-muted">Payment </dt><dd className="inline">{order.payment.label}</dd></div>
            </dl>
          </div>
        </header>

        <section className="grid gap-6 border-b border-line py-6 sm:grid-cols-2">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Bill to / Ship to</h2>
            <address className="mt-2 text-[13px] not-italic leading-relaxed">
              <strong>{a.fullName}</strong><br />{a.line1}{a.line2 ? <><br />{a.line2}</> : null}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone} · {order.email}
            </address>
          </div>
          <div className="sm:text-right">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Place of supply</h2>
            <p className="mt-2 text-[13px]">{a.state}</p>
            <p className="mt-1 text-[12px] text-muted">{order.delivery.label}{order.courier ? ` · ${order.courier.name} ${order.courier.trackingId}` : ""}</p>
          </div>
        </section>

        <table className="mt-6 w-full text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.1em] text-muted">
              <th className="pb-2 font-bold">Item</th>
              <th className="pb-2 text-right font-bold">Qty</th>
              <th className="pb-2 text-right font-bold">Rate</th>
              <th className="pb-2 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.sku} className="border-b border-line/70 align-top">
                <td className="py-2.5 pr-3">
                  <span className="font-semibold">{i.name}</span>
                  <span className="block text-[11.5px] text-muted">{i.color} · {i.size} · {i.sku}</span>
                </td>
                <td className="py-2.5 text-right">{i.quantity}</td>
                <td className="py-2.5 text-right">{inr(i.unitPrice)}</td>
                <td className="py-2.5 text-right">{inr(i.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 ml-auto max-w-[320px] space-y-1.5 text-[13px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4"><span className="text-muted">{k}</span><span>{v}</span></div>
          ))}
          <div className="flex justify-between gap-4 border-t border-line pt-2 text-[15px] font-extrabold"><span>Total</span><span>{inr(t.total)}</span></div>
          <div className="flex justify-between gap-4 pt-1 text-[12px] text-muted"><span>Taxable value</span><span>{inr(t.total - t.tax)}</span></div>
          {intraState ? (
            <>
              <div className="flex justify-between gap-4 text-[12px] text-muted"><span>CGST (6%)</span><span>{inr(t.tax / 2)}</span></div>
              <div className="flex justify-between gap-4 text-[12px] text-muted"><span>SGST (6%)</span><span>{inr(t.tax / 2)}</span></div>
            </>
          ) : (
            <div className="flex justify-between gap-4 text-[12px] text-muted"><span>IGST (12%)</span><span>{inr(t.tax)}</span></div>
          )}
          {refunded > 0 && <div className="flex justify-between gap-4 pt-1 text-[12.5px] font-semibold text-error"><span>Refunded</span><span>− {inr(refunded)}</span></div>}
        </div>

        <footer className="mt-10 border-t border-line pt-4 text-[11.5px] leading-relaxed text-muted">
          Prices include GST. This is a computer-generated invoice and needs no signature. Questions? Write to {site.email} or call {site.phone}.
        </footer>
      </article>
    </main>
  );
}
