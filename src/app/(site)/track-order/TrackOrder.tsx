"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderTracker, STATUS_LABEL } from "@/components/orders/OrderTracker";
import type { Order, OrderStatus } from "@/lib/types";
import { Truck } from "@/components/ui/Icons";
import { FloatingInput } from "@/components/motion/FloatingField";

type Tracked = { id: string; status: OrderStatus; timeline: Order["timeline"]; courier?: Order["courier"]; expectedDelivery: string; city: string; createdAt: string; items: { name: string; image: string; size: string; color: string; quantity: number }[] };

export function TrackOrder() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<Tracked | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (id = orderId, c = contact) => {
    if (!id.trim() || !c.trim()) {
      setError("Enter your order number and the email or mobile used at checkout.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId: id, contact: c }) })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    setLoading(false);
    if (!res.ok) {
      setResult(null);
      setError(res.error);
    } else setResult(res.order);
  };

  // The page is statically prerendered, so read the query string after hydration (e.g. arriving from an order confirmation link).
  useEffect(() => {
    const o = params.get("order");
    const c = params.get("contact");
    if (!o) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync form from the URL
    setOrderId(o);
    if (c) {
      setContact(c);
      lookup(o, c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
        noValidate
        className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
      >
        <FloatingInput id="t-order" label="Order number (e.g. TW-123456)" className="[&_.field]:uppercase" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        <FloatingInput id="t-contact" label="Email or mobile used at checkout" value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? (<><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" aria-hidden /> Finding…</>) : "Track"}
        </button>
      </form>
      <p className="mt-3 text-[12px] text-faint">Try the demo: TW-517406 · arjun@threadsware.in</p>
      {error && (
        <p role="alert" className="mt-8 max-w-3xl border-l-2 border-error bg-error/5 px-5 py-4 text-[13.5px] text-error">
          {error}
        </p>
      )}

      {result && (
        <section aria-live="polite" className="mt-14 border border-line">
          <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line bg-paper p-6 md:p-8">
            <div>
              <p className="eyebrow text-muted">Order {result.id}</p>
              <p className="display-sm mt-3">{STATUS_LABEL[result.status]}</p>
            </div>
            <dl className="flex flex-wrap gap-x-10 gap-y-3 text-[13px]">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{result.status === "delivered" ? "Delivered" : "Expected Delivery"}</dt>
                <dd className="mt-1">{new Date(result.expectedDelivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">Courier</dt>
                <dd className="mt-1">{result.courier?.name ?? "Assigned at dispatch"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">Tracking ID</dt>
                <dd className="mt-1">{result.courier?.trackingId ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">Delivering to</dt>
                <dd className="mt-1">{result.city}</dd>
              </div>
            </dl>
          </header>
          <div className="p-6 md:p-10">
            <OrderTracker order={result} />
          </div>
          <div className="border-t border-line p-6 md:p-8">
            <ul className="flex flex-wrap gap-5">
              {result.items.map((i, k) => (
                <li key={k} className="flex items-center gap-3 text-[13px]">
                  <span className="relative h-16 w-12 overflow-hidden bg-bone">
                    <Image src={i.image} alt="" fill sizes="48px" className="img-grade object-cover" />
                  </span>
                  <span>
                    {i.name}
                    <span className="block text-muted">
                      {i.color} · {i.size} · ×{i.quantity}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-center gap-2 text-[12.5px] text-muted">
              <Truck size={15} /> Questions about your delivery?{" "}
              <Link href="/contact" className="link-static text-ink">
                Contact Customer Care
              </Link>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
