"use client";

import { formatINR } from "@/lib/site";
import { cn } from "@/lib/cn";

export type Totals = { subtotal: number; discount: number; shipping: number; codFee?: number; tax: number; total: number };

export function OrderSummary({ totals, shippingPending = false, className, promoCode }: { totals: Totals; shippingPending?: boolean; className?: string; promoCode?: string }) {
  const row = "flex items-center justify-between text-[13.5px]";
  return (
    <dl className={cn("space-y-3", className)}>
      <div className={row}>
        <dt className="text-muted">Subtotal</dt>
        <dd>{formatINR(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className={row}>
          <dt className="text-muted">Discount{promoCode ? ` (${promoCode})` : ""}</dt>
          <dd className="text-success">−{formatINR(totals.discount)}</dd>
        </div>
      )}
      <div className={row}>
        <dt className="text-muted">Shipping</dt>
        <dd>{shippingPending ? <span className="text-muted">Calculated at checkout</span> : totals.shipping === 0 ? "Complimentary" : formatINR(totals.shipping)}</dd>
      </div>
      {!!totals.codFee && (
        <div className={row}>
          <dt className="text-muted">Cash on Delivery fee</dt>
          <dd>{formatINR(totals.codFee)}</dd>
        </div>
      )}
      <div className={row}>
        <dt className="text-muted">Taxes</dt>
        <dd className="text-muted">Included · GST {formatINR(totals.tax)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <dt className="label-sm">Total</dt>
        <dd className="text-[19px]">
          {formatINR(totals.total)}
        </dd>
      </div>
    </dl>
  );
}
