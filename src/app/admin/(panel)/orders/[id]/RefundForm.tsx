"use client";

import { refundOrder } from "@/app/admin/actions";
import { ActionForm, Field, Submit, Toggle } from "@/components/admin/forms";

const METHODS = { original: "Back to the original payment", bank: "Bank / UPI transfer", store_credit: "Store credit (gift card)", cash: "Cash" };

export function RefundForm({ orderId, left, canRestock }: { orderId: string; left: number; canRestock: boolean }) {
  return (
    <ActionForm action={refundOrder} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <Field label="Amount (₹)" name="amount" type="number" inputMode="numeric" min={1} max={left} defaultValue={left} hint={`Up to ₹${left.toLocaleString("en-IN")}`} />
        <Field label="How" name="method" as="select" defaultValue="original">
          {Object.entries(METHODS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Field>
      </div>
      <Field label="Reason" name="reason" placeholder="Damaged in transit, size exchange not available…" />
      {canRestock && <Toggle name="restock" label="Put the items back in stock" hint="Tick if the pieces came back and can be sold again." />}
      <p className="text-[12px] text-muted">This records the refund. Send the money yourself (Razorpay dashboard, bank or UPI) unless you choose store credit, which creates a gift card for the customer automatically.</p>
      <Submit variant="outline" pendingText="Recording…">Record refund</Submit>
    </ActionForm>
  );
}
