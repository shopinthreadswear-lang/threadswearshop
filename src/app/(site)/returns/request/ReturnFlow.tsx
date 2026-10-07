"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Order } from "@/lib/types";
import { getProductById } from "@/data/products";
import { Check } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

const REASONS = ["Size issue", "Fit issue", "Product damaged", "Wrong item", "Changed mind", "Other"] as const;
const REFUNDS = ["Original payment method", "Store credit (instant)", "Bank transfer"] as const;

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line py-8">
      <legend className="flex items-center gap-3 label-sm">
        <span className="grid h-6 w-6 place-items-center rounded-full border border-ink text-[10px]">{n}</span> {title}
      </legend>
      <div className="mt-6">{children}</div>
    </fieldset>
  );
}

type GuestOrder = { id: string; items: Order["items"] };

export function ReturnFlow({ orders, signedIn }: { orders: Order[]; signedIn: boolean }) {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState(params.get("order") ?? orders[0]?.id ?? "");
  const [guest, setGuest] = useState({ orderId: "", contact: "" });
  const [skus, setSkus] = useState<string[]>([]);
  const [reason, setReason] = useState<(typeof REASONS)[number] | "">("");
  const [details, setDetails] = useState("");
  const [resolution, setResolution] = useState<"return" | "exchange">("exchange");
  const [exchangeSize, setExchangeSize] = useState("");
  const [refund, setRefund] = useState<(typeof REFUNDS)[number]>(REFUNDS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const order: GuestOrder | undefined = orders.find((o) => o.id === orderId);
  const selectedProduct = order && skus.length === 1 ? getProductById(order.items.find((i) => i.sku === skus[0])!.productId) : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const id = signedIn && orders.length ? orderId : guest.orderId;
    if (!id) return setError("Select or enter your order number.");
    if (signedIn && orders.length && !skus.length) return setError("Select at least one item.");
    if (!reason) return setError("Choose a reason.");
    if (resolution === "exchange" && signedIn && skus.length === 1 && selectedProduct && !exchangeSize) return setError("Choose the size you’d like instead.");
    setLoading(true);
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId: id, contact: guest.contact || undefined, skus: skus.length ? skus : ["*"], reason, details, resolution, exchangeSize: exchangeSize || undefined, refundMethod: resolution === "return" ? refund : undefined }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setDone(res.request.id);
  };

  if (done)
    return (
      <div className="mt-12 border border-line p-10 text-center" role="status">
        <Check size={30} className="mx-auto text-success" />
        <p className="display-sm mt-5">Request {done} received</p>
        <p className="mx-auto mt-3 max-w-md text-[14px] text-muted">We’ll confirm your pickup slot by email and SMS within a few hours. Please keep the pieces in their original packaging with tags attached.</p>
        <Link href={signedIn ? "/account/orders" : "/"} className="btn btn-outline mt-8">
          {signedIn ? "Back to Orders" : "Return Home"}
        </Link>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="mt-10">
      <Step n={1} title="Select Order">
        {signedIn && orders.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {orders.map((o) => (
              <label key={o.id} className={cn("flex cursor-pointer gap-3 border p-4 text-[13px]", orderId === o.id ? "border-ink" : "border-line")}>
                <input type="radio" name="order" className="check mt-0.5" checked={orderId === o.id} onChange={() => { setOrderId(o.id); setSkus([]); }} />
                <span>
                  <span className="font-semibold">{o.id}</span>
                  <span className="block text-muted">Delivered · {o.items.length} {o.items.length === 1 ? "item" : "items"}</span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="r-order" className="field-label">Order Number</label>
              <input id="r-order" className="field uppercase" value={guest.orderId} onChange={(e) => setGuest({ ...guest, orderId: e.target.value })} placeholder="TW-123456" />
            </div>
            <div>
              <label htmlFor="r-contact" className="field-label">Email or Mobile</label>
              <input id="r-contact" className="field" value={guest.contact} onChange={(e) => setGuest({ ...guest, contact: e.target.value })} />
            </div>
            <p className="text-[12.5px] text-muted sm:col-span-2">
              {signedIn ? "No delivered orders on your account yet." : <>Have an account? <Link href="/account/login?next=/returns/request" className="link-static text-ink">Sign in</Link> to choose from your orders.</>}
            </p>
          </div>
        )}
      </Step>

      {order && (
        <Step n={2} title="Select Products">
          <ul className="space-y-3">
            {order.items.map((i) => (
              <li key={i.sku}>
                <label className={cn("flex cursor-pointer items-center gap-4 border p-3", skus.includes(i.sku) ? "border-ink" : "border-line")}>
                  <input type="checkbox" className="check" checked={skus.includes(i.sku)} onChange={(e) => setSkus(e.target.checked ? [...skus, i.sku] : skus.filter((s) => s !== i.sku))} />
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-bone">
                    <Image src={i.image} alt="" fill sizes="48px" className="img-grade object-cover" />
                  </span>
                  <span className="text-[13.5px]">
                    {i.name}
                    <span className="block text-muted">
                      {i.color} · {i.size} · ×{i.quantity}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Step>
      )}

      <Step n={order ? 3 : 2} title="Reason">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {REASONS.map((r) => (
            <button key={r} type="button" aria-pressed={reason === r} onClick={() => setReason(r)} className={cn("h-12 border px-3 text-[13px] transition-colors", reason === r ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink")}>
              {r}
            </button>
          ))}
        </div>
        <label htmlFor="r-details" className="field-label mt-6">Anything else we should know? (optional)</label>
        <textarea id="r-details" className="field" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
      </Step>

      <Step n={order ? 4 : 3} title="Return or Exchange">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["exchange", "Exchange", "Swap for a different size — always free"],
              ["return", "Return", "Refund to your chosen method"],
            ] as const
          ).map(([k, t, d]) => (
            <label key={k} className={cn("flex cursor-pointer gap-3 border p-5", resolution === k ? "border-ink" : "border-line")}>
              <input type="radio" name="resolution" className="check mt-0.5" checked={resolution === k} onChange={() => setResolution(k)} />
              <span>
                <span className="block text-[14px]">{t}</span>
                <span className="block text-[12.5px] text-muted">{d}</span>
              </span>
            </label>
          ))}
        </div>
        {resolution === "exchange" && selectedProduct && (
          <div className="mt-6">
            <p className="field-label">New size</p>
            <div className="flex flex-wrap gap-2">
              {selectedProduct.sizes.map((s) => (
                <button key={s} type="button" aria-pressed={exchangeSize === s} onClick={() => setExchangeSize(s)} className={cn("h-11 min-w-12 border px-3 text-[12.5px]", exchangeSize === s ? "border-ink bg-ink text-ivory" : "border-line")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {resolution === "return" && (
          <div className="mt-6">
            <p className="field-label">Refund method</p>
            <div className="space-y-2">
              {REFUNDS.map((r) => (
                <label key={r} className="flex items-center gap-3 text-[13.5px]">
                  <input type="radio" name="refund" className="check" checked={refund === r} onChange={() => setRefund(r)} /> {r}
                </label>
              ))}
            </div>
          </div>
        )}
      </Step>

      {error && (
        <p role="alert" className="mb-6 border-l-2 border-error bg-error/5 px-5 py-4 text-[13.5px] text-error">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Submitting…" : "Submit Request"}
      </button>
    </form>
  );
}
