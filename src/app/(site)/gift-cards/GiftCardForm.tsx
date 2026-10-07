"use client";

import { useState } from "react";
import { useStore } from "@/components/providers/StoreProvider";
import { GIFT_CARD_AMOUNTS, GIFT_CARD_ID } from "@/lib/giftcards";
import { isEmail } from "@/lib/validation";
import { formatINR } from "@/lib/site";
import { cn } from "@/lib/cn";

export function GiftCardForm() {
  const { addToCart } = useStore();
  const [amount, setAmount] = useState(5000);
  const [f, setF] = useState({ recipient: "", recipientEmail: "", sender: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (f.recipient.trim().length < 2) err.recipient = "Enter the recipient’s name";
    if (!isEmail(f.recipientEmail)) err.recipientEmail = "Enter a valid email address";
    setErrors(err);
    if (Object.keys(err).length) return;
    addToCart({ productId: GIFT_CARD_ID, color: "Digital", size: String(amount), giftCard: { amount, recipient: f.recipient, recipientEmail: f.recipientEmail, message: f.message ? `${f.message}${f.sender ? ` — ${f.sender}` : ""}` : undefined } });
  };
  return (
    <form onSubmit={submit} noValidate className="mt-10 space-y-6">
      <fieldset>
        <legend className="field-label">Amount</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {GIFT_CARD_AMOUNTS.map((a) => (
            <button key={a} type="button" aria-pressed={amount === a} onClick={() => setAmount(a)} className={cn("h-12 border text-[13px] transition-colors", amount === a ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink")}>
              {formatINR(a)}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="gc-r" className="field-label">Recipient name</label>
          <input id="gc-r" className="field" value={f.recipient} onChange={(e) => setF({ ...f, recipient: e.target.value })} aria-invalid={!!errors.recipient} />
          {errors.recipient && <p className="field-error">{errors.recipient}</p>}
        </div>
        <div>
          <label htmlFor="gc-e" className="field-label">Recipient email</label>
          <input id="gc-e" type="email" className="field" value={f.recipientEmail} onChange={(e) => setF({ ...f, recipientEmail: e.target.value })} aria-invalid={!!errors.recipientEmail} />
          {errors.recipientEmail && <p className="field-error">{errors.recipientEmail}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="gc-s" className="field-label">From</label>
          <input id="gc-s" className="field" value={f.sender} onChange={(e) => setF({ ...f, sender: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="gc-m" className="field-label">Personal message (optional)</label>
          <textarea id="gc-m" className="field" rows={3} maxLength={240} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
          <p className="mt-1 text-right text-[11px] text-faint">{f.message.length}/240</p>
        </div>
      </div>
      <button type="submit" className="btn btn-primary btn-block">
        Add {formatINR(amount)} Gift Card to Bag
      </button>
    </form>
  );
}

export function BalanceCheck() {
  const [code, setCode] = useState("");
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/gift-cards/balance", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    setRes(r.ok ? { ok: true, text: `Available balance: ${formatINR(r.balance)} of ${formatINR(r.initial)}` } : { ok: false, text: r.error });
  };
  return (
    <form onSubmit={check} className="mt-12 bg-paper p-7">
      <h2 className="label-sm">Check your balance</h2>
      <div className="mt-4 flex gap-2">
        <label htmlFor="gc-code" className="sr-only">Gift card code</label>
        <input id="gc-code" className="field bg-ivory uppercase tracking-[0.1em]" placeholder="TWGC-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" className="btn btn-outline" disabled={code.length < 6}>Check</button>
      </div>
      {res && <p className={cn("mt-3 text-[13px]", res.ok ? "text-success" : "text-error")} role="status">{res.text}</p>}
      <p className="mt-2 text-[11.5px] text-faint">Demo code: TWGC-DEMO-2026</p>
    </form>
  );
}
