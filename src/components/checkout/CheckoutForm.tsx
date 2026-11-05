"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, resolveLine } from "@/components/providers/StoreProvider";
import { AddressForm, emptyAddress, validateAddress, type AddressValue } from "./AddressForm";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { PromoCode } from "@/components/cart/PromoCode";
import { Check, Lock, Shield, ReturnIcon, ChevronDown } from "@/components/ui/Icons";
import { computeTotals, deliveryOptions, type DeliveryMethod } from "@/lib/pricing";
import { commerce, formatINR } from "@/lib/site";
import { cardBrand, isEmail, isPhone, luhn, validExpiry } from "@/lib/validation";
import { GIFT_CARD_ID } from "@/lib/giftcards";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type Step = 1 | 2 | 3 | 4 | 5;
type PayMethod = "upi" | "card" | "netbanking" | "wallet" | "cod" | "giftcard";
const STEPS = ["Contact", "Shipping", "Delivery", "Payment", "Review"];
const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Yes Bank", "IndusInd Bank"];
const WALLETS = ["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"];

function StepHeader({ n, current, title, summary, onEdit }: { n: Step; current: Step; title: string; summary?: React.ReactNode; onEdit: () => void }) {
  const done = current > n;
  return (
    <div className="flex items-start justify-between gap-4 py-6">
      <div className="flex items-start gap-4">
        <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] transition-colors duration-500", done ? "border-ink bg-ink text-ivory" : current === n ? "border-ink" : "border-line text-faint")}>
          {done ? <Check size={12} /> : n}
        </span>
        <div>
          <h2 className={cn("label-sm", current < n && "text-faint")}>{title}</h2>
          {done && summary && <div className="mt-2 text-[13.5px] leading-relaxed text-muted">{summary}</div>}
        </div>
      </div>
      {done && (
        <button type="button" onClick={onEdit} className="text-[12px] link-static">
          Edit
        </button>
      )}
    </div>
  );
}

function Panel({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
          <div className="pb-8 pl-0 sm:pl-11">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, promo, user, hydrated, clearCart } = useStore();
  const [step, setStep] = useState<Step>(1);
  const [contact, setContact] = useState({ email: "", phone: "", marketing: true });
  const [address, setAddress] = useState<AddressValue>(emptyAddress);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [saveAddress, setSaveAddress] = useState(true);
  const [delivery, setDelivery] = useState<DeliveryMethod>("standard");
  const [method, setMethod] = useState<PayMethod>("upi");
  const [pay, setPay] = useState({ vpa: "", card: "", expiry: "", cvv: "", holder: "", bank: BANKS[0], wallet: WALLETS[0], giftCode: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [agree, setAgree] = useState(true);

  const giftCardOnly = lines.length > 0 && lines.every((l) => l.productId === GIFT_CARD_ID);
  const codAllowed = !giftCardOnly && subtotal <= commerce.codLimit;
  const totals = computeTotals({ subtotal, promo, delivery, cod: method === "cod", giftCardOnly });

  // Prefill for signed-in customers.
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill once user loads
    setContact((c) => ({ ...c, email: c.email || user.email, phone: c.phone || user.phone || "" }));
    const def = user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
    if (def) {
      setSelectedAddressId(def.id);
      setAddress({ fullName: def.fullName, phone: def.phone, line1: def.line1, line2: def.line2 ?? "", city: def.city, state: def.state, pincode: def.pincode, country: "India" });
    }
  }, [user]);

  useEffect(() => {
    if (hydrated && lines.length)
      track({ name: "begin_checkout", value: subtotal, coupon: promo?.code, items: lines.map((l) => ({ item_id: l.productId, item_name: resolveLine(l)?.name ?? "", price: resolveLine(l)?.price ?? 0, quantity: l.quantity })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const items = useMemo(() => lines.map((l) => ({ l, r: resolveLine(l) })).filter((x) => x.r), [lines]);

  const next = (s: Step) => {
    setErrors({});
    setStep(s);
    setTimeout(() => document.getElementById(`step-${s}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!isEmail(contact.email)) err.email = "Enter a valid email address";
    if (!isPhone(contact.phone)) err.phone = "Enter a valid 10-digit mobile number";
    setErrors(err);
    if (Object.keys(err).length) return;
    if (!address.phone) setAddress((a) => ({ ...a, phone: contact.phone }));
    next(2);
  };

  const submitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateAddress(address);
    setErrors(err);
    if (Object.keys(err).length) return;
    next(3);
  };

  const submitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    track({ name: "add_shipping_info", value: totals.total, shipping_tier: delivery });
    next(4);
  };

  const payLabel = () => {
    switch (method) {
      case "upi":
        return `UPI · ${pay.vpa}`;
      case "card":
        return `${cardBrand(pay.card)} ending ${pay.card.replace(/\D/g, "").slice(-4)}`;
      case "netbanking":
        return `Net Banking · ${pay.bank}`;
      case "wallet":
        return `Wallet · ${pay.wallet}`;
      case "cod":
        return "Cash on Delivery";
      case "giftcard":
        return `Gift Card · ${pay.giftCode.toUpperCase()}`;
    }
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (method === "upi" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(pay.vpa.trim())) err.vpa = "Enter a valid UPI ID, e.g. name@okhdfc";
    if (method === "card") {
      if (!luhn(pay.card)) err.card = "Enter a valid card number";
      if (!validExpiry(pay.expiry)) err.expiry = "Enter a valid expiry (MM/YY)";
      if (!/^\d{3,4}$/.test(pay.cvv)) err.cvv = "Enter the 3 or 4 digit CVV";
      if (pay.holder.trim().length < 2) err.holder = "Enter the name on your card";
    }
    if (method === "giftcard" && pay.giftCode.trim().length < 6) err.giftCode = "Enter your gift card code";
    setErrors(err);
    if (Object.keys(err).length) return;
    track({ name: "add_payment_info", value: totals.total, payment_type: method });
    next(5);
  };

  const placeOrder = async () => {
    if (!agree) {
      setOrderError("Please accept the Terms & Conditions to continue.");
      return;
    }
    setPlacing(true);
    setOrderError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lines: lines.map(({ productId, color, size, quantity, giftCard }) => ({ productId, color, size, quantity, giftCard })),
          contact: { email: contact.email, phone: contact.phone },
          address,
          saveAddress: !!user && selectedAddressId === "new" && saveAddress,
          delivery,
          // Card data is tokenised by the gateway in production; only the last four digits reach our server.
          payment: { method, vpa: pay.vpa || undefined, cardNumber: method === "card" ? pay.card.replace(/\D/g, "").slice(-4) : undefined, bank: pay.bank, wallet: pay.wallet, giftCardCode: pay.giftCode || undefined, label: payLabel() },
          promoCode: promo?.code ?? "",
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setOrderError(json.error ?? "Your payment could not be completed.");
        if (res.status === 402) setStep(4);
        setPlacing(false);
        return;
      }
      track({ name: "purchase", transaction_id: json.orderId, value: json.total, coupon: promo?.code, shipping: totals.shipping, tax: totals.tax, items: lines.map((l) => ({ item_id: l.productId, item_name: resolveLine(l)?.name ?? "", price: resolveLine(l)?.price ?? 0, quantity: l.quantity })) });
      router.push(`/order-confirmation/${json.orderId}?t=${json.token}`);
      setTimeout(clearCart, 400);
    } catch {
      setOrderError("Something went wrong. Please try again.");
      setPlacing(false);
    }
  };

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (!lines.length)
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="display-md">Your bag is empty</p>
        <p className="mt-4 text-[14px] text-muted">Discover pieces designed for the way you live.</p>
        <Link href="/new-arrivals" className="btn btn-primary mt-8">
          Shop New Arrivals
        </Link>
      </div>
    );

  const inputErr = (k: string) => (errors[k] ? <p className="field-error">{errors[k]}</p> : null);

  const summary = (
    <div>
      <ul className="divide-y divide-line">
        {items.map(({ l, r }) => (
          <li key={l.key} className="flex gap-4 py-4">
            <div className="relative h-24 w-[72px] shrink-0 overflow-hidden bg-bone">
              <Image src={r!.image} alt={r!.name} fill sizes="72px" className="img-grade object-cover" />
              <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center bg-ink px-1 text-[10px] text-ivory">{l.quantity}</span>
            </div>
            <div className="flex-1 text-[13px]">
              <p>{r!.name}</p>
              <p className="mt-1 text-muted">
                {r!.colorLabel} · {r!.sizeLabel}
              </p>
            </div>
            <p className="text-[13px]">{formatINR(r!.price * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="border-t border-line pt-5">
        <PromoCode />
      </div>
      <OrderSummary totals={totals} className="mt-6 border-t border-line pt-6" promoCode={promo?.code} />
      <div className="mt-6 space-y-2.5 border-t border-line pt-6 text-[12px] text-muted">
        <p className="flex items-center gap-2.5"><Lock size={13} /> 256-bit SSL encrypted payment</p>
        <p className="flex items-center gap-2.5"><Shield size={14} /> PCI-DSS compliant payment partners</p>
        <p className="flex items-center gap-2.5"><ReturnIcon size={14} /> Free 15-day returns & exchanges</p>
      </div>
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      {/* Mobile summary toggle */}
      <div className="border-y border-line lg:hidden">
        <button type="button" onClick={() => setSummaryOpen((o) => !o)} aria-expanded={summaryOpen} className="flex w-full items-center justify-between py-4 text-[13px]">
          <span className="flex items-center gap-2">
            {summaryOpen ? "Hide" : "Show"} order summary <ChevronDown className={cn("transition-transform", summaryOpen && "rotate-180")} />
          </span>
          <span className="text-[15px]">{formatINR(totals.total)}</span>
        </button>
        <Panel open={summaryOpen}>
          <div className="-ml-0 sm:-ml-11">{summary}</div>
        </Panel>
      </div>

      <div className="lg:col-span-7">
        <ol className="mb-6 hidden items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] sm:flex" aria-label="Checkout progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span className={cn(step === i + 1 ? "text-ink" : step > i + 1 ? "text-charcoal" : "text-faint")} aria-current={step === i + 1 ? "step" : undefined}>
                {s}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-line" aria-hidden />}
            </li>
          ))}
        </ol>

        {orderError && (
          <div role="alert" className="mb-6 border-l-2 border-error bg-error/5 px-5 py-4 text-[13.5px] text-error">
            {orderError}
          </div>
        )}

        <div className="divide-y divide-line border-y border-line">
          {/* 1 · Contact */}
          <section id="step-1" className="scroll-mt-24">
            <StepHeader n={1} current={step} title="Contact" onEdit={() => next(1)} summary={<>{contact.email}<br />{contact.phone}</>} />
            <Panel open={step === 1}>
              {!user && (
                <p className="mb-6 text-[13px] text-muted">
                  Checking out as a guest.{" "}
                  <Link href="/account/login?next=/checkout" className="link-static text-ink">
                    Sign in
                  </Link>{" "}
                  for faster checkout with saved addresses.
                </p>
              )}
              <form onSubmit={submitContact} noValidate className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-email" className="field-label">Email</label>
                  <input id="co-email" type="email" autoComplete="email" className="field" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} aria-invalid={!!errors.email} />
                  {inputErr("email")}
                </div>
                <div>
                  <label htmlFor="co-phone" className="field-label">Mobile Number</label>
                  <input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" className="field" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} aria-invalid={!!errors.phone} placeholder="For delivery updates" />
                  {inputErr("phone")}
                </div>
                <label className="flex items-center gap-3 text-[13px] text-muted sm:col-span-2">
                  <input type="checkbox" className="check" checked={contact.marketing} onChange={(e) => setContact({ ...contact, marketing: e.target.checked })} />
                  Email me about new collections and private releases
                </label>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto">Continue to Shipping</button>
                </div>
              </form>
            </Panel>
          </section>

          {/* 2 · Shipping */}
          <section id="step-2" className="scroll-mt-24">
            <StepHeader
              n={2}
              current={step}
              title="Shipping Address"
              onEdit={() => next(2)}
              summary={
                <>
                  {address.fullName}
                  <br />
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.state} {address.pincode}
                </>
              }
            />
            <Panel open={step === 2}>
              <form onSubmit={submitAddress} noValidate>
                {user && user.addresses.length > 0 && (
                  <fieldset className="mb-8">
                    <legend className="field-label">Saved addresses</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {user.addresses.map((a) => (
                        <label key={a.id} className={cn("flex cursor-pointer gap-3 border p-4 text-[13px] transition-colors", selectedAddressId === a.id ? "border-ink" : "border-line hover:border-beige")}>
                          <input
                            type="radio"
                            name="saved-address"
                            className="check mt-0.5"
                            checked={selectedAddressId === a.id}
                            onChange={() => {
                              setSelectedAddressId(a.id);
                              setAddress({ fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, pincode: a.pincode, country: "India" });
                            }}
                          />
                          <span>
                            <span className="font-semibold">{a.label}</span>
                            <span className="mt-1 block text-muted">
                              {a.fullName}, {a.line1}, {a.city} {a.pincode}
                            </span>
                          </span>
                        </label>
                      ))}
                      <label className={cn("flex cursor-pointer items-center gap-3 border p-4 text-[13px]", selectedAddressId === "new" ? "border-ink" : "border-line hover:border-beige")}>
                        <input
                          type="radio"
                          name="saved-address"
                          className="check"
                          checked={selectedAddressId === "new"}
                          onChange={() => {
                            setSelectedAddressId("new");
                            setAddress({ ...emptyAddress, phone: contact.phone });
                          }}
                        />
                        Ship to a new address
                      </label>
                    </div>
                  </fieldset>
                )}
                {(selectedAddressId === "new" || !user?.addresses.length) && (
                  <>
                    <AddressForm value={address} onChange={setAddress} errors={errors} idPrefix="co" />
                    {user && (
                      <label className="mt-5 flex items-center gap-3 text-[13px] text-muted">
                        <input type="checkbox" className="check" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                        Save this address to my account
                      </label>
                    )}
                  </>
                )}
                <button type="submit" className="btn btn-primary mt-8 w-full sm:w-auto">Continue to Delivery</button>
              </form>
            </Panel>
          </section>

          {/* 3 · Delivery */}
          <section id="step-3" className="scroll-mt-24">
            <StepHeader n={3} current={step} title="Delivery" onEdit={() => next(3)} summary={<>{deliveryOptions[delivery].label} · {totals.shipping ? formatINR(totals.shipping) : "Complimentary"}</>} />
            <Panel open={step === 3}>
              <form onSubmit={submitDelivery}>
                <fieldset className="space-y-3">
                  <legend className="sr-only">Delivery method</legend>
                  {(Object.keys(deliveryOptions) as DeliveryMethod[]).map((d) => {
                    const price = giftCardOnly ? 0 : deliveryOptions[d].price(subtotal);
                    const metro = /^(11|40|56|60|50|70|41|12|20)/.test(address.pincode);
                    const disabled = d === "express" && (!metro || giftCardOnly);
                    return (
                      <label key={d} className={cn("flex cursor-pointer items-center gap-4 border p-5 transition-colors", delivery === d ? "border-ink" : "border-line hover:border-beige", disabled && "cursor-not-allowed opacity-45")}>
                        <input type="radio" name="delivery" className="check" checked={delivery === d} disabled={disabled} onChange={() => setDelivery(d)} />
                        <span className="flex-1">
                          <span className="block text-[14px]">{deliveryOptions[d].label}</span>
                          <span className="mt-0.5 block text-[12.5px] text-muted">{disabled && d === "express" ? "Not available for this PIN code" : deliveryOptions[d].eta}</span>
                        </span>
                        <span className="text-[14px]">{price === 0 ? "Complimentary" : formatINR(price)}</span>
                      </label>
                    );
                  })}
                </fieldset>
                <p className="mt-4 text-[12.5px] text-muted">Orders placed before 2pm IST are dispatched the same day. Every order ships in our signature packaging.</p>
                <button type="submit" className="btn btn-primary mt-8 w-full sm:w-auto">Continue to Payment</button>
              </form>
            </Panel>
          </section>

          {/* 4 · Payment */}
          <section id="step-4" className="scroll-mt-24">
            <StepHeader n={4} current={step} title="Payment" onEdit={() => next(4)} summary={payLabel()} />
            <Panel open={step === 4}>
              <form onSubmit={submitPayment} noValidate>
                <p className="mb-5 flex items-center gap-2 text-[12.5px] text-muted">
                  <Lock size={13} /> All transactions are secure and encrypted.
                </p>
                <fieldset className="divide-y divide-line border border-line">
                  <legend className="sr-only">Payment method</legend>
                  {(
                    [
                      ["upi", "UPI", "Google Pay, PhonePe, Paytm & all UPI apps"],
                      ["card", "Credit / Debit Card", "Visa, Mastercard, RuPay, Amex"],
                      ["netbanking", "Net Banking", "All major Indian banks"],
                      ["wallet", "Wallets", "Paytm, PhonePe, Amazon Pay"],
                      ["giftcard", "Threads Wear Gift Card", "Redeem your gift card balance"],
                      ["cod", "Cash on Delivery", codAllowed ? `₹${commerce.codFee} handling fee` : `Available on orders up to ₹${commerce.codLimit.toLocaleString("en-IN")}`],
                    ] as [PayMethod, string, string][]
                  ).map(([m, label, hint]) => {
                    const disabled = m === "cod" && !codAllowed;
                    return (
                      <div key={m}>
                        <label className={cn("flex cursor-pointer items-center gap-4 px-5 py-4", disabled && "cursor-not-allowed opacity-45", method === m && "bg-paper")}>
                          <input type="radio" name="pay" className="check" checked={method === m} disabled={disabled} onChange={() => setMethod(m)} />
                          <span className="flex-1">
                            <span className="block text-[14px]">{label}</span>
                            <span className="block text-[12px] text-muted">{hint}</span>
                          </span>
                        </label>
                        <AnimatePresence initial={false}>
                          {method === m && m !== "cod" && (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden bg-paper">
                              <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
                                {m === "upi" && (
                                  <div className="sm:col-span-2">
                                    <label htmlFor="vpa" className="field-label">UPI ID</label>
                                    <input id="vpa" className="field bg-ivory" placeholder="yourname@okhdfc" value={pay.vpa} onChange={(e) => setPay({ ...pay, vpa: e.target.value })} aria-invalid={!!errors.vpa} autoComplete="off" />
                                    {inputErr("vpa")}
                                    <p className="mt-2 text-[12px] text-muted">You’ll approve the payment request in your UPI app.</p>
                                  </div>
                                )}
                                {m === "card" && (
                                  <>
                                    <div className="sm:col-span-2">
                                      <label htmlFor="cc" className="field-label">Card Number</label>
                                      <div className="relative">
                                        <input
                                          id="cc"
                                          inputMode="numeric"
                                          autoComplete="cc-number"
                                          className="field bg-ivory pr-24 tracking-[0.08em]"
                                          placeholder="1234 5678 9012 3456"
                                          value={pay.card}
                                          onChange={(e) => setPay({ ...pay, card: e.target.value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ") })}
                                          aria-invalid={!!errors.card}
                                        />
                                        {pay.card.length > 1 && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{cardBrand(pay.card)}</span>}
                                      </div>
                                      {inputErr("card")}
                                    </div>
                                    <div>
                                      <label htmlFor="exp" className="field-label">Expiry</label>
                                      <input
                                        id="exp"
                                        inputMode="numeric"
                                        autoComplete="cc-exp"
                                        className="field bg-ivory"
                                        placeholder="MM/YY"
                                        value={pay.expiry}
                                        onChange={(e) => {
                                          const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                                          setPay({ ...pay, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
                                        }}
                                        aria-invalid={!!errors.expiry}
                                      />
                                      {inputErr("expiry")}
                                    </div>
                                    <div>
                                      <label htmlFor="cvv" className="field-label">CVV</label>
                                      <input id="cvv" type="password" inputMode="numeric" autoComplete="cc-csc" className="field bg-ivory" placeholder="•••" maxLength={4} value={pay.cvv} onChange={(e) => setPay({ ...pay, cvv: e.target.value.replace(/\D/g, "") })} aria-invalid={!!errors.cvv} />
                                      {inputErr("cvv")}
                                    </div>
                                    <div className="sm:col-span-2">
                                      <label htmlFor="holder" className="field-label">Name on Card</label>
                                      <input id="holder" autoComplete="cc-name" className="field bg-ivory" value={pay.holder} onChange={(e) => setPay({ ...pay, holder: e.target.value })} aria-invalid={!!errors.holder} />
                                      {inputErr("holder")}
                                    </div>
                                    <p className="text-[11.5px] text-faint sm:col-span-2">Your card details are encrypted and tokenised by our payment partner — they are never stored on Threads Wear servers.</p>
                                  </>
                                )}
                                {m === "netbanking" && (
                                  <div className="sm:col-span-2">
                                    <label htmlFor="bank" className="field-label">Select your bank</label>
                                    <select id="bank" className="field bg-ivory" value={pay.bank} onChange={(e) => setPay({ ...pay, bank: e.target.value })}>
                                      {BANKS.map((b) => (
                                        <option key={b}>{b}</option>
                                      ))}
                                    </select>
                                    <p className="mt-2 text-[12px] text-muted">You’ll be redirected securely to your bank to authorise payment.</p>
                                  </div>
                                )}
                                {m === "wallet" && (
                                  <div className="sm:col-span-2">
                                    <label htmlFor="wallet" className="field-label">Select wallet</label>
                                    <select id="wallet" className="field bg-ivory" value={pay.wallet} onChange={(e) => setPay({ ...pay, wallet: e.target.value })}>
                                      {WALLETS.map((w) => (
                                        <option key={w}>{w}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                                {m === "giftcard" && (
                                  <div className="sm:col-span-2">
                                    <label htmlFor="gc" className="field-label">Gift card code</label>
                                    <input id="gc" className="field bg-ivory uppercase tracking-[0.1em]" placeholder="TWGC-XXXX-XXXX" value={pay.giftCode} onChange={(e) => setPay({ ...pay, giftCode: e.target.value })} aria-invalid={!!errors.giftCode} />
                                    {inputErr("giftCode")}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </fieldset>
                <button type="submit" className="btn btn-primary mt-8 w-full sm:w-auto">Review Order</button>
              </form>
            </Panel>
          </section>

          {/* 5 · Review */}
          <section id="step-5" className="scroll-mt-24">
            <StepHeader n={5} current={step} title="Review & Place Order" onEdit={() => next(5)} />
            <Panel open={step === 5}>
              <dl className="grid gap-6 text-[13.5px] sm:grid-cols-2">
                <div>
                  <dt className="field-label">Ship to</dt>
                  <dd className="text-muted">
                    {address.fullName}, {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}
                  </dd>
                </div>
                <div>
                  <dt className="field-label">Contact</dt>
                  <dd className="text-muted">
                    {contact.email} · {contact.phone}
                  </dd>
                </div>
                <div>
                  <dt className="field-label">Delivery</dt>
                  <dd className="text-muted">
                    {deliveryOptions[delivery].label} — {deliveryOptions[delivery].eta}
                  </dd>
                </div>
                <div>
                  <dt className="field-label">Payment</dt>
                  <dd className="text-muted">{payLabel()}</dd>
                </div>
              </dl>
              <label className="mt-8 flex items-start gap-3 text-[13px] text-muted">
                <input type="checkbox" className="check mt-0.5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="link-static text-ink">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="link-static text-ink">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              <button type="button" onClick={placeOrder} disabled={placing} className="btn btn-primary btn-block mt-6 h-14">
                <Lock size={14} />
                <span>{placing ? "Processing securely…" : method === "cod" ? `Place Order · ${formatINR(totals.total)}` : `Pay ${formatINR(totals.total)}`}</span>
              </button>
              <p className="mt-3 text-center text-[11.5px] text-faint">Prices verified at checkout. You will receive confirmation by email and SMS.</p>
            </Panel>
          </section>
        </div>
      </div>

      <aside className="hidden lg:col-span-5 lg:block" aria-label="Order summary">
        <div className="sticky top-24 bg-paper p-8">
          <h2 className="label-sm mb-2">Order Summary</h2>
          {summary}
        </div>
      </aside>
    </div>
  );
}
