import Image from "next/image";
import Link from "next/link";
import type { Order } from "@/lib/types";
import { STATUS_LABEL } from "@/components/orders/OrderTracker";
import { formatINR } from "@/lib/site";
import { cn } from "@/lib/cn";

export function OrderCard({ order }: { order: Order }) {
  const placed = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const eta = new Date(order.expectedDelivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return (
    <article className="border border-line">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-paper px-5 py-4 text-[12.5px]">
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <dt className="text-[10.5px] uppercase tracking-[0.14em] text-muted">Order</dt>
            <dd>{order.id}</dd>
          </div>
          <div>
            <dt className="text-[10.5px] uppercase tracking-[0.14em] text-muted">Placed</dt>
            <dd>{placed}</dd>
          </div>
          <div>
            <dt className="text-[10.5px] uppercase tracking-[0.14em] text-muted">Total</dt>
            <dd>{formatINR(order.totals.total)}</dd>
          </div>
        </dl>
        <Link href={`/account/orders/${order.id}`} className="label-sm text-[10.5px] link-u">
          View Details
        </Link>
      </header>
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={cn("flex items-center gap-2 text-[13.5px]", order.status === "delivered" ? "text-success" : "text-ink")}>
            <span className={cn("h-2 w-2 rounded-full", order.status === "delivered" ? "bg-success" : "bg-champagne")} />
            {STATUS_LABEL[order.status]}
          </p>
          <p className="mt-1 text-[12.5px] text-muted">{order.status === "delivered" ? `Delivered ${eta}` : `Expected ${eta}`}</p>
        </div>
        <ul className="flex gap-2">
          {order.items.slice(0, 4).map((i) => (
            <li key={i.sku} className="relative h-20 w-16 overflow-hidden bg-bone">
              <Image src={i.image} alt={i.name} fill sizes="64px" className="img-grade object-cover" />
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
