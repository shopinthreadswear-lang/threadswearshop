import type { Order, OrderStatus } from "@/lib/types";
import { Check } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

export const TRACK_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "placed", label: "Order Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const fmt = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function OrderTracker({ order }: { order: Pick<Order, "status" | "timeline"> }) {
  const idx = TRACK_STEPS.findIndex((s) => s.status === order.status);
  return (
    <ol className="relative grid gap-0 md:grid-cols-6" aria-label="Order progress">
      {TRACK_STEPS.map((s, i) => {
        const done = i <= idx;
        const current = i === idx;
        const at = order.timeline.find((t) => t.status === s.status);
        return (
          <li key={s.status} className="relative flex gap-4 pb-8 md:block md:pb-0" aria-current={current ? "step" : undefined}>
            {i < TRACK_STEPS.length - 1 && (
              <span aria-hidden className={cn("absolute left-[13px] top-7 h-[calc(100%-28px)] w-px md:left-7 md:top-[13px] md:h-px md:w-[calc(100%-28px)]", i < idx ? "bg-ink" : "bg-line")} />
            )}
            <span className={cn("relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors", done ? "border-ink bg-ink text-ivory" : "border-line bg-ivory text-faint", current && "ring-4 ring-ink/10")}>
              {done ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-line" />}
            </span>
            <div className="md:mt-4 md:pr-4">
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", done ? "text-ink" : "text-faint")}>{s.label}</p>
              {at && <p className="mt-1 text-[12px] text-muted">{fmt(at.at)}</p>}
              {at?.note && <p className="mt-0.5 text-[12px] text-muted">{at.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
