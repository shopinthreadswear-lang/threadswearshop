"use client";

import { useState } from "react";
import { isEmail } from "@/lib/validation";
import { Check } from "@/components/ui/Icons";
import { FloatingInput, FloatingSelect, FloatingTextarea } from "@/components/motion/FloatingField";
import { isEmail as validEmail } from "@/lib/validation";

const TOPICS = ["Orders & Delivery", "Returns & Exchanges", "Product Information", "Sizing Advice", "Payments", "General Enquiry"];

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", orderNumber: "", topic: TOPICS[0], message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | string>("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (f.name.trim().length < 2) err.name = "Please enter your name";
    if (!isEmail(f.email)) err.email = "Enter a valid email address";
    if (f.message.trim().length < 10) err.message = "Please add a few more details";
    setErrors(err);
    if (Object.keys(err).length) return;
    setState("loading");
    const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(f) })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    if (!res.ok) {
      setErrors({ form: res.error, ...(res.fields ?? {}) });
      setState("idle");
    } else setState(res.ticket);
  };
  if (state !== "idle" && state !== "loading")
    return (
      <div className="mt-8 py-6" role="status">
        <Check size={26} className="text-success" />
        <p className="display-sm mt-4">Thank you, {f.name.split(" ")[0]}.</p>
        <p className="mt-3 text-[14px] text-muted">Your reference is <span className="text-ink">{state}</span>. We’ll reply to {f.email} within one working day.</p>
      </div>
    );
  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-5 sm:grid-cols-2">
      {errors.form && <p className="field-error sm:col-span-2" role="alert">{errors.form}</p>}
      <FloatingInput label="Name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} valid={f.name.trim().length > 1} className="[&_.field]:bg-ivory" />
      <FloatingInput label="Email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={errors.email} valid={validEmail(f.email)} className="[&_.field]:bg-ivory" />
      <FloatingInput label="Phone (optional)" type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="[&_.field]:bg-ivory" />
      <FloatingInput label="Order number (optional)" value={f.orderNumber} onChange={(e) => setF({ ...f, orderNumber: e.target.value })} className="[&_.field]:bg-ivory" />
      <FloatingSelect label="Topic" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} className="sm:col-span-2 [&_.field]:bg-ivory">
        {TOPICS.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </FloatingSelect>
      <FloatingTextarea label="How can we help?" rows={6} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} error={errors.message} className="sm:col-span-2 [&_.field]:bg-ivory" />
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "loading"} className="btn btn-primary">{state === "loading" ? (<><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" aria-hidden /> Sending…</>) : "Send Message"}</button>
      </div>
    </form>
  );
}
