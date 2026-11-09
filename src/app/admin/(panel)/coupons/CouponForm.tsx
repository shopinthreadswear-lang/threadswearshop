"use client";

import { useState } from "react";
import { saveCoupon } from "@/app/admin/actions";
import type { Coupon } from "@/lib/server/promos";
import { ActionForm, Field, Submit, Toggle } from "@/components/admin/forms";

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const [type, setType] = useState<"percent" | "fixed">(coupon?.type ?? "percent");
  return (
    <ActionForm action={saveCoupon} className="space-y-4" resetOnSuccess={!coupon}>
      {coupon && <input type="hidden" name="couponId" value={coupon.id} />}
      <Field label="Code" name="code" defaultValue={coupon?.code} placeholder="DIWALI20" autoCapitalize="characters" autoComplete="off" spellCheck={false} hint="Letters, numbers and dashes. Customers type this at checkout." />
      <fieldset>
        <legend className="mb-2 text-[12px] font-bold text-ink">Discount type</legend>
        <div className="flex gap-2">
          {(["percent", "fixed"] as const).map((t) => (
            <label key={t} className="inline-flex h-10 cursor-pointer items-center rounded-full border border-line px-4 text-[13px] font-semibold transition-colors has-[:checked]:border-burgundy has-[:checked]:bg-burgundy has-[:checked]:text-cream">
              <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
              {t === "percent" ? "Percentage off" : "Fixed ₹ off"}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={type === "percent" ? "Percent off" : "Rupees off"} name="value" type="number" inputMode="numeric" min={1} defaultValue={coupon?.value} placeholder={type === "percent" ? "10" : "500"} />
        <Field label="Minimum order (₹) — optional" name="minSubtotal" type="number" inputMode="numeric" min={0} defaultValue={coupon?.minSubtotal ?? ""} />
        <Field label="Total uses allowed — optional" name="usageLimit" type="number" inputMode="numeric" min={0} defaultValue={coupon?.usageLimit ?? ""} hint="Leave empty for no limit." />
        <Field label="Last day — optional" name="expires" type="date" defaultValue={coupon?.expires?.slice(0, 10) ?? ""} />
      </div>
      <Field label="Description" name="description" defaultValue={coupon?.description} placeholder="20% off for Diwali" hint="Customers see this when the code is applied." />
      <Toggle name="active" label="Active" defaultChecked={coupon?.active ?? true} hint="Untick to pause the code without deleting it." />
      <Submit>{coupon ? "Save code" : "Create code"}</Submit>
    </ActionForm>
  );
}
