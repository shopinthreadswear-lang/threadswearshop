"use client";

import { commerce, formatINR } from "@/lib/site";
import { Truck } from "@/components/ui/Icons";

export function FreeShipping({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, commerce.freeShippingThreshold - subtotal);
  const pct = Math.min(100, (subtotal / commerce.freeShippingThreshold) * 100);
  return (
    <div>
      <p className="flex items-center gap-2.5 text-[12.5px]">
        <Truck size={16} />
        {remaining > 0 ? (
          <span>
            You’re <strong className="font-semibold">{formatINR(remaining)}</strong> away from complimentary shipping.
          </span>
        ) : (
          <span>Your order qualifies for complimentary shipping.</span>
        )}
      </p>
      <div className="mt-3 h-[2px] bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Progress to free shipping">
        <div className="h-full bg-ink transition-[width] duration-700 ease-[var(--ease-lux)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
