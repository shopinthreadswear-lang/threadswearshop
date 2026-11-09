"use client";

import { setCustomerBlocked } from "@/app/admin/actions";
import { ActionForm, Field, Submit } from "@/components/admin/forms";

export function BlockForm({ userId, blocked }: { userId: string; blocked: boolean }) {
  return (
    <ActionForm action={setCustomerBlocked} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="block" value={blocked ? "false" : "true"} />
      {!blocked && (
        <>
          <p className="text-[12.5px] text-muted">They’ll be signed out and won’t be able to sign in or place orders with this email. You can undo this any time.</p>
          <Field label="Reason (only you see this)" name="reason" placeholder="Repeated COD refusals, fraud…" />
        </>
      )}
      <Submit variant="outline" pendingText="Saving…">{blocked ? "Unblock" : "Block customer"}</Submit>
    </ActionForm>
  );
}
