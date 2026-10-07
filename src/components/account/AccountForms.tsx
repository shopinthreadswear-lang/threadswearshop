"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Address, PublicUser, SavedPayment } from "@/lib/types";
import { AddressForm, emptyAddress, validateAddress, type AddressValue } from "@/components/checkout/AddressForm";
import { useStore } from "@/components/providers/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { Plus } from "@/components/ui/Icons";
import { cardBrand, isEmail, isPhone, luhn, validExpiry } from "@/lib/validation";
import { cn } from "@/lib/cn";

async function api(url: string, method: string, body: unknown) {
  try {
    const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return await r.json();
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { toast } = useStore();
  const [editing, setEditing] = useState<(AddressValue & { id?: string; label: string; isDefault?: boolean }) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const err = validateAddress(editing);
    setErrors(err);
    if (Object.keys(err).length) return;
    setSaving(true);
    const res = await api("/api/me/addresses", "POST", editing);
    setSaving(false);
    if (!res.ok) return setErrors({ form: res.error, ...(res.fields ?? {}) });
    setEditing(null);
    toast("Address saved");
    router.refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Remove this address?")) return;
    const res = await api("/api/me/addresses", "DELETE", { id });
    if (res.ok) {
      toast("Address removed");
      router.refresh();
    }
  };
  const makeDefault = async (a: Address) => {
    const res = await api("/api/me/addresses", "POST", { ...a, isDefault: true });
    if (res.ok) router.refresh();
  };

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className={cn("flex flex-col border p-6", a.isDefault ? "border-ink" : "border-line")}>
            <div className="flex items-center justify-between">
              <p className="label-sm">{a.label}</p>
              {a.isDefault && <span className="bg-ink px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ivory">Default</span>}
            </div>
            <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-muted">
              {a.fullName}
              <br />
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              {a.phone}
            </p>
            <div className="mt-5 flex gap-5 text-[12.5px]">
              <button type="button" className="link-static" onClick={() => setEditing({ ...a, line2: a.line2 ?? "", country: "India" })}>
                Edit
              </button>
              {!a.isDefault && (
                <button type="button" className="link-static" onClick={() => makeDefault(a)}>
                  Set as default
                </button>
              )}
              <button type="button" className="text-muted link-static hover:text-error" onClick={() => remove(a.id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setEditing({ ...emptyAddress, label: addresses.length ? "Other" : "Home" })} className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 border border-dashed border-beige text-[13px] transition-colors hover:border-ink">
            <Plus size={18} /> Add a new address
          </button>
        </li>
      </ul>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Address" : "New Address"} wide>
        {editing && (
          <form onSubmit={save} noValidate>
            {errors.form && <p className="field-error mb-4" role="alert">{errors.form}</p>}
            <div className="mb-5">
              <label htmlFor="ad-label" className="field-label">Label</label>
              <div className="flex gap-2">
                {["Home", "Work", "Other"].map((l) => (
                  <button key={l} type="button" aria-pressed={editing.label === l} onClick={() => setEditing({ ...editing, label: l })} className={cn("h-10 border px-5 text-[12.5px]", editing.label === l ? "border-ink bg-ink text-ivory" : "border-line")}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <AddressForm value={editing} onChange={(v) => setEditing({ ...editing, ...v })} errors={errors} idPrefix="ad" />
            <label className="mt-5 flex items-center gap-3 text-[13px] text-muted">
              <input type="checkbox" className="check" checked={!!editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} />
              Make this my default address
            </label>
            <button type="submit" disabled={saving} className="btn btn-primary mt-8">
              {saving ? "Saving…" : "Save Address"}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}

export function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const { toast, setUser } = useStore();
  const [f, setF] = useState({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone ?? "", dob: user.dob ?? "" });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (f.firstName.trim().length < 2) err.firstName = "Enter your first name";
    if (f.lastName.trim().length < 2) err.lastName = "Enter your last name";
    if (!isEmail(f.email)) err.email = "Enter a valid email address";
    if (f.phone && !isPhone(f.phone)) err.phone = "Enter a valid 10-digit mobile number";
    setErrors(err);
    if (Object.keys(err).length) return;
    setSaving(true);
    const res = await api("/api/me", "PATCH", f);
    setSaving(false);
    if (!res.ok) return setErrors({ form: res.error, ...(res.fields ?? {}) });
    setUser(res.user);
    toast("Profile updated");
    router.refresh();
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8 || !/\d/.test(pw.next) || !/[A-Za-z]/.test(pw.next)) return setPwErrors({ next: "Use 8+ characters with a letter and a number" });
    const res = await api("/api/me/password", "POST", pw);
    if (!res.ok) return setPwErrors({ form: res.error, ...(res.fields ?? {}) });
    setPwErrors({});
    setPw({ current: "", next: "" });
    toast("Password changed");
  };

  const input = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`pf-${k}`} className="field-label">{label}</label>
      <input id={`pf-${k}`} className="field" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <p className="field-error">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="space-y-14">
      <form onSubmit={save} noValidate className="grid max-w-2xl gap-5 sm:grid-cols-2">
        {errors.form && <p className="field-error sm:col-span-2" role="alert">{errors.form}</p>}
        {input("firstName", "First Name", { autoComplete: "given-name" })}
        {input("lastName", "Last Name", { autoComplete: "family-name" })}
        {input("email", "Email", { type: "email", autoComplete: "email" })}
        {input("phone", "Mobile", { type: "tel", autoComplete: "tel" })}
        {input("dob", "Date of Birth (for a birthday surprise)", { type: "date" })}
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
      <form onSubmit={changePw} noValidate className="max-w-2xl border-t border-line pt-10">
        <h2 className="label-sm mb-6">Change Password</h2>
        {pwErrors.form && <p className="field-error mb-4" role="alert">{pwErrors.form}</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="pw-current" className="field-label">Current Password</label>
            <input id="pw-current" type="password" autoComplete="current-password" className="field" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} aria-invalid={!!pwErrors.current} />
            {pwErrors.current && <p className="field-error">{pwErrors.current}</p>}
          </div>
          <div>
            <label htmlFor="pw-next" className="field-label">New Password</label>
            <input id="pw-next" type="password" autoComplete="new-password" className="field" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} aria-invalid={!!pwErrors.next} />
            {pwErrors.next && <p className="field-error">{pwErrors.next}</p>}
          </div>
        </div>
        <button type="submit" className="btn btn-outline mt-6" disabled={!pw.current || !pw.next}>
          Update Password
        </button>
      </form>
    </div>
  );
}

export function PaymentMethods({ payments }: { payments: SavedPayment[] }) {
  const router = useRouter();
  const { toast } = useStore();
  const [adding, setAdding] = useState<"card" | "upi" | null>(null);
  const [f, setF] = useState({ number: "", expiry: "", holder: "", vpa: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (adding === "card") {
      if (!luhn(f.number)) err.number = "Enter a valid card number";
      if (!validExpiry(f.expiry)) err.expiry = "Use MM/YY";
      if (f.holder.trim().length < 2) err.holder = "Enter the name on card";
    } else if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(f.vpa)) err.vpa = "Enter a valid UPI ID";
    setErrors(err);
    if (Object.keys(err).length) return;
    const res = await api("/api/me/payments", "POST", adding === "card" ? { type: "card", number: f.number, expiry: f.expiry, holder: f.holder } : { type: "upi", vpa: f.vpa });
    if (!res.ok) return setErrors({ form: res.error, ...(res.fields ?? {}) });
    setAdding(null);
    setF({ number: "", expiry: "", holder: "", vpa: "" });
    toast("Payment method saved securely");
    router.refresh();
  };
  const act = async (method: "PATCH" | "DELETE", id: string) => {
    if (method === "DELETE" && !confirm("Remove this payment method?")) return;
    const res = await api("/api/me/payments", method, { id });
    if (res.ok) router.refresh();
  };

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2">
        {payments.map((p) => (
          <li key={p.id} className={cn("relative flex aspect-[1.7] max-h-52 flex-col justify-between p-6", p.isDefault ? "bg-night text-ivory" : "border border-line")}>
            <div className="flex items-start justify-between">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] opacity-70">{p.type === "card" ? p.brand : "UPI"}</p>
              {p.isDefault && <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-champagne-soft">Default</span>}
            </div>
            <p className="font-serif text-[24px] tracking-wide">{p.type === "card" ? `•••• •••• •••• ${p.last4}` : p.vpa}</p>
            <div className="flex items-end justify-between text-[12px]">
              <span className="opacity-70">{p.type === "card" ? `${p.holder} · ${p.expiry}` : "Verified UPI ID"}</span>
              <span className="flex gap-4">
                {!p.isDefault && (
                  <button type="button" className="link-static" onClick={() => act("PATCH", p.id)}>
                    Make default
                  </button>
                )}
                <button type="button" className="link-static opacity-80" onClick={() => act("DELETE", p.id)}>
                  Remove
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setAdding("card")}>
          <Plus size={12} /> Add Card
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setAdding("upi")}>
          <Plus size={12} /> Add UPI ID
        </button>
      </div>
      <p className="mt-6 max-w-xl text-[12.5px] text-muted">Cards are tokenised by our PCI-DSS certified payment partner in line with RBI guidelines. Threads Ware stores only the card brand, last four digits and expiry — never your full card number or CVV.</p>
      <Modal open={!!adding} onClose={() => setAdding(null)} title={adding === "card" ? "Add a Card" : "Add a UPI ID"}>
        <form onSubmit={save} noValidate className="space-y-5">
          {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
          {adding === "card" ? (
            <>
              <div>
                <label htmlFor="pm-num" className="field-label">Card Number</label>
                <input id="pm-num" inputMode="numeric" autoComplete="cc-number" className="field" value={f.number} onChange={(e) => setF({ ...f, number: e.target.value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ") })} aria-invalid={!!errors.number} />
                {errors.number ? <p className="field-error">{errors.number}</p> : f.number.length > 1 && <p className="mt-1 text-[12px] text-muted">{cardBrand(f.number)}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pm-exp" className="field-label">Expiry</label>
                  <input id="pm-exp" placeholder="MM/YY" className="field" value={f.expiry} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setF({ ...f, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} aria-invalid={!!errors.expiry} />
                  {errors.expiry && <p className="field-error">{errors.expiry}</p>}
                </div>
                <div>
                  <label htmlFor="pm-holder" className="field-label">Name on Card</label>
                  <input id="pm-holder" autoComplete="cc-name" className="field" value={f.holder} onChange={(e) => setF({ ...f, holder: e.target.value })} aria-invalid={!!errors.holder} />
                  {errors.holder && <p className="field-error">{errors.holder}</p>}
                </div>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="pm-vpa" className="field-label">UPI ID</label>
              <input id="pm-vpa" placeholder="name@okhdfc" className="field" value={f.vpa} onChange={(e) => setF({ ...f, vpa: e.target.value })} aria-invalid={!!errors.vpa} />
              {errors.vpa && <p className="field-error">{errors.vpa}</p>}
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block">Save Securely</button>
        </form>
      </Modal>
    </>
  );
}

export function PreferencesForm({ prefs }: { prefs: PublicUser["preferences"] }) {
  const { toast } = useStore();
  const [p, setP] = useState(prefs);
  const [saving, setSaving] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await api("/api/me", "PATCH", { preferences: p });
    setSaving(false);
    toast(res.ok ? "Preferences saved" : res.error, res.ok ? undefined : { tone: "error" });
  };
  const toggle = (k: "newsletter" | "sms" | "whatsapp", label: string, hint: string) => (
    <label className="flex items-start justify-between gap-6 border-b border-line py-5">
      <span>
        <span className="block text-[14px]">{label}</span>
        <span className="block text-[12.5px] text-muted">{hint}</span>
      </span>
      <input type="checkbox" className="check mt-1" checked={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.checked })} />
    </label>
  );
  return (
    <form onSubmit={save} className="max-w-2xl">
      <h2 className="label-sm mb-2">Communication</h2>
      {toggle("newsletter", "Email newsletter", "New collections, private releases and the Journal")}
      {toggle("sms", "SMS updates", "Order and delivery notifications")}
      {toggle("whatsapp", "WhatsApp", "Order updates and stylist recommendations")}
      <h2 className="label-sm mb-4 mt-12">Fit Profile</h2>
      <p className="mb-6 text-[13px] text-muted">Used to pre-select your size and personalise recommendations.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pref-size" className="field-label">Usual top size</label>
          <select id="pref-size" className="field" value={p.preferredSize ?? ""} onChange={(e) => setP({ ...p, preferredSize: e.target.value })}>
            <option value="">Not set</option>
            {["XS", "S", "M", "L", "XL", "XXL"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="pref-fit" className="field-label">Preferred fit</label>
          <select id="pref-fit" className="field" value={p.preferredFit ?? ""} onChange={(e) => setP({ ...p, preferredFit: e.target.value })}>
            <option value="">Not set</option>
            {["Slim", "Regular", "Relaxed", "Oversized"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" disabled={saving} className="btn btn-primary mt-10">
        {saving ? "Saving…" : "Save Preferences"}
      </button>
    </form>
  );
}
