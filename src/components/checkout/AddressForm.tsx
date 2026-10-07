"use client";

import { STATES, lookupPincode } from "@/lib/india";
import { cn } from "@/lib/cn";

export type AddressValue = { fullName: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string; country: "India" };
export const emptyAddress: AddressValue = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "India" };

export function AddressForm({ value, onChange, errors = {}, idPrefix = "addr" }: { value: AddressValue; onChange: (v: AddressValue) => void; errors?: Record<string, string>; idPrefix?: string }) {
  const set = (k: keyof AddressValue, v: string) => {
    const next = { ...value, [k]: v };
    if (k === "pincode" && v.length === 6) {
      const hit = lookupPincode(v);
      if (hit?.state && !value.state) next.state = hit.state;
      if (hit?.city && !value.city) next.city = hit.city;
    }
    onChange(next);
  };
  const field = (k: keyof AddressValue, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, className?: string) => (
    <div className={className}>
      <label htmlFor={`${idPrefix}-${k}`} className="field-label">
        {label}
      </label>
      <input id={`${idPrefix}-${k}`} className="field" value={value[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${idPrefix}-${k}-err` : undefined} {...props} />
      {errors[k] && (
        <p id={`${idPrefix}-${k}-err`} className="field-error">
          {errors[k]}
        </p>
      )}
    </div>
  );
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {field("fullName", "Full Name", { autoComplete: "name" })}
      {field("phone", "Mobile Number", { autoComplete: "tel", inputMode: "tel", placeholder: "10-digit mobile" })}
      {field("line1", "Address", { autoComplete: "address-line1", placeholder: "House / flat no., building, street" }, "sm:col-span-2")}
      {field("line2", "Apartment, area, landmark (optional)", { autoComplete: "address-line2" }, "sm:col-span-2")}
      {field("pincode", "PIN Code", { autoComplete: "postal-code", inputMode: "numeric", maxLength: 6 })}
      {field("city", "City", { autoComplete: "address-level2" })}
      <div>
        <label htmlFor={`${idPrefix}-state`} className="field-label">
          State
        </label>
        <select id={`${idPrefix}-state`} className={cn("field", !value.state && "text-faint")} value={value.state} onChange={(e) => set("state", e.target.value)} aria-invalid={!!errors.state} autoComplete="address-level1">
          <option value="">Select state</option>
          {STATES.map((s) => (
            <option key={s} className="text-ink">
              {s}
            </option>
          ))}
        </select>
        {errors.state && <p className="field-error">{errors.state}</p>}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-country`} className="field-label">
          Country
        </label>
        <input id={`${idPrefix}-country`} className="field bg-bone/50 text-muted" value="India" readOnly aria-readonly />
      </div>
    </div>
  );
}

export function validateAddress(a: AddressValue) {
  const e: Record<string, string> = {};
  if (a.fullName.trim().length < 2) e.fullName = "Please enter your full name";
  if (!/^(\+91[\s-]?)?[6-9]\d{9}$/.test(a.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit mobile number";
  if (a.line1.trim().length < 5) e.line1 = "Enter your house / flat and street";
  if (a.city.trim().length < 2) e.city = "Enter your city";
  if (!a.state) e.state = "Select your state";
  if (!/^[1-9]\d{5}$/.test(a.pincode)) e.pincode = "Enter a valid 6-digit PIN code";
  return e;
}
