import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import { read } from "@/lib/server/store";
import { OrderTracker, STATUS_LABEL } from "@/components/orders/OrderTracker";
import { OrderItems } from "@/components/orders/OrderItems";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata = { title: "Order Details", robots: { index: false } };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const { order, returns } = await read((db) => ({ order: db.orders.find((o) => o.id === id && o.userId === user.id), returns: db.returns.filter((r) => r.orderId === id) }));
  if (!order) notFound();
  const a = order.shippingAddress;
  const eta = new Date(order.expectedDelivery).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  return (
    <>
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Orders", href: "/account/orders" }, { label: order.id }]} className="mb-8" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-md">Order {order.id}</h1>
          <p className="mt-2 text-[13.5px] text-muted">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {STATUS_LABEL[order.status]}
          </p>
        </div>
        <div className="flex gap-2">
          {order.status === "delivered" && (
            <Link href={`/returns/request?order=${order.id}`} className="btn btn-outline btn-sm">
              Return / Exchange
            </Link>
          )}
          <a href={`mailto:care@threadsware.in?subject=Invoice%20${order.id}`} className="btn btn-outline btn-sm">
            Request Invoice
          </a>
        </div>
      </div>

      <section className="mt-10 border border-line p-6 md:p-8" aria-label="Tracking">
        <div className="mb-8 flex flex-wrap justify-between gap-4 text-[13px]">
          <p>
            <span className="text-muted">{order.status === "delivered" ? "Delivered" : "Expected delivery"}:</span> {eta}
          </p>
          {order.courier && (
            <p>
              <span className="text-muted">{order.courier.name} · </span>
              {order.courier.trackingId}
            </p>
          )}
        </div>
        <OrderTracker order={order} />
      </section>

      {returns.length > 0 && (
        <div className="mt-6 border-l-2 border-champagne bg-paper px-5 py-4 text-[13.5px]">
          {returns.map((r) => (
            <p key={r.id}>
              {r.resolution === "exchange" ? "Exchange" : "Return"} {r.id} requested · {r.items.map((i) => i.name).join(", ")} — pickup will be scheduled within 48 hours.
            </p>
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="label-sm mb-4">Items</h2>
          <OrderItems items={order.items} />
        </div>
        <div className="space-y-8 lg:col-span-2">
          <div className="bg-paper p-6">
            <h2 className="label-sm mb-5">Payment</h2>
            <OrderSummary totals={order.totals} promoCode={order.promoCode} />
            <p className="mt-4 text-[12.5px] text-muted">{order.payment.label}</p>
          </div>
          <div>
            <h2 className="label-sm mb-3">Shipping Address</h2>
            <p className="text-[13.5px] leading-relaxed text-muted">
              {a.fullName}
              <br />
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              {a.phone}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
