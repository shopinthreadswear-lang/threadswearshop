"use client";

import { saveOffer } from "@/app/admin/actions";
import { ActionForm, Field, Submit, Toggle } from "@/components/admin/forms";

export function OfferForm({ scopes }: { scopes: { value: string; label: string }[] }) {
  return (
    <ActionForm action={saveOffer} className="space-y-4" resetOnSuccess>
      <Field label="Offer name" name="name" placeholder="Weekend shirt sale" hint="Only you see this." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Discount (%)" name="percent" type="number" inputMode="numeric" min={1} max={90} placeholder="20" />
        <Field label="Ends on — optional" name="endsAt" type="date" />
      </div>
      <Field label="Applies to" name="scope" as="select" defaultValue="all">
        {scopes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Field>
      <Toggle name="active" label="Start now" defaultChecked hint="Untick to save it paused." />
      <Submit>Create offer</Submit>
    </ActionForm>
  );
}
