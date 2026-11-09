"use client";

import { useState } from "react";
import type { OrderStatus } from "@/lib/types";
import { updateOrderStatus } from "@/app/admin/actions";
import { ActionForm, Field, Submit } from "@/components/admin/forms";

export function OrderActions({ orderId, next, courier }: { orderId: string; next: { value: OrderStatus; label: string }[]; courier?: { name: string; trackingId: string } }) {
  const forward = next.filter((n) => n.value !== "cancelled");
  const canCancel = next.some((n) => n.value === "cancelled");
  const [picked, setStatus] = useState<OrderStatus>(forward[0]?.value ?? next[0].value);
  // After an update the choices move on; fall back to the new next step.
  const status = next.some((n) => n.value === picked) ? picked : (forward[0]?.value ?? next[0].value);
  const shipping = status === "shipped";

  return (
    <ActionForm action={updateOrderStatus} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <fieldset>
        <legend className="mb-2 text-[12px] font-bold text-ink">Move this order to</legend>
        <div className="flex flex-wrap gap-2">
          {next.map((n) => (
            <label key={n.value} className={`inline-flex h-10 cursor-pointer items-center rounded-full border px-4 text-[13px] font-semibold transition-colors has-[:checked]:border-burgundy has-[:checked]:bg-burgundy has-[:checked]:text-cream ${n.value === "cancelled" ? "border-error/30 text-error" : "border-line"}`}>
              <input type="radio" name="status" value={n.value} checked={status === n.value} onChange={() => setStatus(n.value)} className="sr-only" />
              {n.label}
            </label>
          ))}
        </div>
      </fieldset>
      {shipping && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Courier" name="courierName" defaultValue={courier?.name} placeholder="Blue Dart, Delhivery…" />
          <Field label="Tracking number" name="trackingId" defaultValue={courier?.trackingId} placeholder="AWB number" />
        </div>
      )}
      <Field label="Note (optional)" name="note" placeholder={status === "cancelled" ? "Why it was cancelled" : "Visible in the order history"} />
      {status === "cancelled" && canCancel && <p className="rounded-chip bg-error/8 px-4 py-3 text-[12.5px] text-error">Cancelling puts the items back in stock. Refund the payment separately in your payment provider.</p>}
      <Submit pendingText="Updating…">{status === "cancelled" ? "Cancel order" : `Mark ${next.find((n) => n.value === status)?.label.toLowerCase()}`}</Submit>
    </ActionForm>
  );
}
