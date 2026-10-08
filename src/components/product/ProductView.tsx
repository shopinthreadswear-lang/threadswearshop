"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { imagesFor } from "@/data/products";
import { getCategory } from "@/data/categories";
import { chartForCategory } from "@/data/sizeGuide";
import { useStore } from "@/components/providers/StoreProvider";
import { ProductGallery } from "./ProductGallery";
import { FabricViewer } from "./FabricViewer";
import { ColorSwatches } from "./ColorSwatches";
import { SizeSelector } from "./SizeSelector";
import { WishlistButton } from "./WishlistButton";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { AccordionItem } from "@/components/ui/Accordion";
import { Modal } from "@/components/ui/Modal";
import { ArrowRight, BagIcon, Check, Lock, Pin, ReturnIcon, Ruler, Shield, Gift } from "@/components/ui/Icons";
import { commerce, formatINR } from "@/lib/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

function PincodeChecker() {
  const [pin, setPin] = useState("");
  const [res, setRes] = useState<{ ok: boolean; message: string; cod?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tw.pincode");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore saved pincode
      if (saved) setPin(saved);
    } catch {}
  }, []);
  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setRes({ ok: false, message: "Enter a valid 6-digit PIN code." });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/pincode?pin=${pin}`);
      const j = await r.json();
      setRes(j.ok ? { ok: j.serviceable, message: j.message, cod: j.cod } : { ok: false, message: j.error });
      try {
        localStorage.setItem("tw.pincode", pin);
      } catch {}
    } catch {
      setRes({ ok: false, message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={check} className="border-t border-line pt-6">
      <label htmlFor="pincode" className="label-sm flex items-center gap-2">
        <Pin size={15} /> Delivery
      </label>
      <div className="mt-3 flex border-b border-line focus-within:border-ink">
        <input id="pincode" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="Enter PIN code" className="h-11 flex-1 bg-transparent text-[14px] focus:outline-none" aria-describedby="pin-res" />
        <button type="submit" disabled={loading} className="label-sm text-[11px] hover:opacity-60">
          {loading ? "Checking…" : "Check"}
        </button>
      </div>
      <p id="pin-res" aria-live="polite" className={cn("mt-2 text-[12.5px]", res ? (res.ok ? "text-success" : "text-error") : "text-muted")}>
        {res ? (
          <>
            {res.message}
            {res.ok && res.cod && <span className="text-muted"> · Cash on Delivery available</span>}
          </>
        ) : (
          "Check estimated delivery and Cash on Delivery availability."
        )}
      </p>
    </form>
  );
}

function FindMySize({ product, onPick }: { product: Product; onPick: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [h, setH] = useState(178);
  const [w, setW] = useState(74);
  const [pref, setPref] = useState<"closer" | "regular" | "relaxed">("regular");
  const tops = ["XS", "S", "M", "L", "XL", "XXL"];
  const rec = useMemo(() => {
    if (!product.sizes.every((s) => tops.includes(s))) return null;
    const bmi = w / (h / 100) ** 2;
    let i = h < 168 ? 1 : h < 176 ? 2 : h < 184 ? 2 : 3;
    if (bmi > 27) i++;
    if (bmi > 30) i++;
    if (bmi < 20) i--;
    if (pref === "closer") i--;
    if (pref === "relaxed") i++;
    if (product.fit === "Oversized") i--;
    return tops[Math.max(0, Math.min(5, i))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h, w, pref, product.fit, product.sizes]);
  if (!product.sizes.every((s) => tops.includes(s))) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-[12px] link-static">
        Find my size
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Find Your Size">
        <p className="text-[13.5px] text-muted">Based on thousands of Threads Ware orders and returns. {product.fit} fit.</p>
        <div className="mt-6 space-y-6">
          <label className="block">
            <span className="field-label flex justify-between">
              Height <span className="font-normal normal-case tracking-normal text-muted">{h} cm</span>
            </span>
            <input type="range" min={155} max={200} value={h} onChange={(e) => setH(+e.target.value)} className="w-full accent-ink" />
          </label>
          <label className="block">
            <span className="field-label flex justify-between">
              Weight <span className="font-normal normal-case tracking-normal text-muted">{w} kg</span>
            </span>
            <input type="range" min={50} max={120} value={w} onChange={(e) => setW(+e.target.value)} className="w-full accent-ink" />
          </label>
          <fieldset>
            <legend className="field-label">Preferred fit</legend>
            <div className="grid grid-cols-3 gap-2">
              {(["closer", "regular", "relaxed"] as const).map((p) => (
                <button key={p} type="button" aria-pressed={pref === p} onClick={() => setPref(p)} className={cn("h-11 border text-[12px] capitalize", pref === p ? "border-ink bg-ink text-ivory" : "border-line")}>
                  {p}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <p className="text-[14px]">
            We recommend <span className="font-serif text-[30px] leading-none">{rec}</span>
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (rec) onPick(rec);
              setOpen(false);
            }}
          >
            Select {rec}
          </button>
        </div>
      </Modal>
    </>
  );
}

function NotifyMe({ open, onClose, product, color, size }: { open: boolean; onClose: () => void; product: Product; color: string; size: string | null }) {
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const { user } = useStore();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill for signed-in users
    if (open && user && !contact) setContact(user.email);
    if (!open) setState("idle");
  }, [open, user, contact]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("loading");
    const res = await fetch("/api/notify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: product.id, color, size: size ?? product.sizes[0], contact }) }).then((r) => r.json()).catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    if (res.ok) setState("done");
    else {
      setState("idle");
      setError(res.fields?.contact ?? res.error);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Notify Me">
      {state === "done" ? (
        <div className="py-4 text-center">
          <Check size={28} className="mx-auto text-success" />
          <p className="display-sm mt-4">You’re on the list.</p>
          <p className="mt-3 text-[14px] text-muted">
            We’ll let you know the moment {product.name} in {color}
            {size ? `, size ${size},` : ""} is back.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <p className="text-[14px] text-charcoal">
            {product.name} — {color}
            {size ? ` / ${size}` : ""}
          </p>
          <p className="mt-2 text-[13px] text-muted">Leave your email or mobile number and we’ll message you as soon as it’s back in stock. No spam, ever.</p>
          <label htmlFor="notify-contact" className="field-label mt-6">
            Email or mobile
          </label>
          <input id="notify-contact" value={contact} onChange={(e) => setContact(e.target.value)} className="field" aria-invalid={!!error} aria-describedby={error ? "notify-err" : undefined} data-autofocus />
          {error && (
            <p id="notify-err" className="field-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={state === "loading" || !contact} className="btn btn-primary btn-block mt-6">
            {state === "loading" ? "Saving…" : "Notify Me"}
          </button>
        </form>
      )}
    </Modal>
  );
}

export function ProductView({ product: p, children }: { product: Product; children?: React.ReactNode }) {
  const [color, setColor] = useState(p.colors[0].name);
  // PDPs are statically generated — apply a ?color= preselection after hydration.
  useEffect(() => {
    // Read the query string after hydration (not useSearchParams) so the page is fully server-rendered — no layout shift.
    const c = p.colors.find((x) => x.name === new URLSearchParams(window.location.search).get("color"))?.name;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync colour from the URL
    if (c) setColor(c);
  }, [p.colors]);
  const [size, setSize] = useState<string | null>(p.sizes.length === 1 ? p.sizes[0] : null);
  const [sizeError, setSizeError] = useState(false);
  const [notify, setNotify] = useState(false);
  const [adding, setAdding] = useState(false);
  const [liveStock, setLiveStock] = useState<Record<string, number> | null>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { addToCart, pushRecentlyViewed, openSizeGuide } = useStore();
  const images = imagesFor(p, color);
  const cat = getCategory(p.category);

  useEffect(() => {
    pushRecentlyViewed(p.id);
    track({ name: "view_item", value: p.price, items: [{ item_id: p.id, item_name: p.name, price: p.price, item_category: p.category }] });
    fetch(`/api/stock?id=${p.id}`)
      .then((r) => r.json())
      .then((j) => j.ok && setLiveStock(j.stock))
      .catch(() => {});
  }, [p.id, p.name, p.price, p.category, pushRecentlyViewed]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stockFor = (s: string) => liveStock?.[`${color}|${s}`] ?? p.variants.find((v) => v.color === color && v.size === s)?.stock ?? 0;
  const selectedStock = size ? stockFor(size) : null;
  const allOut = p.sizes.every((s) => stockFor(s) <= 0);
  const selectedOut = selectedStock !== null && selectedStock <= 0;

  const add = () => {
    if (allOut) {
      setNotify(true);
      return;
    }
    if (!size) {
      setSizeError(true);
      document.getElementById("size-select")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (selectedOut) {
      setNotify(true);
      return;
    }
    setAdding(true);
    setTimeout(() => {
      addToCart({ productId: p.id, color, size });
      setAdding(false);
    }, 350);
  };

  const ctaLabel = allOut || selectedOut ? "Notify Me" : adding ? "Adding…" : "Add to Bag";

  return (
    <>
      <div className="grid gap-8 md:grid-cols-12 md:gap-10 lg:gap-16">
        <div className="-mx-[var(--spacing-gutter)] md:col-span-7 md:mx-0">
          <ProductGallery images={images} name={p.name} />
        </div>

        <div className="md:col-span-5">
          <div className="md:sticky md:top-[84px] md:pb-10">
            <p className="eyebrow text-muted">THREADS WARE</p>
            <h1 className="mt-3 font-serif text-[clamp(2rem,3.2vw,2.9rem)] leading-[1.05]">{p.name}</h1>
            <p className="mt-3 text-[14px] text-muted">{p.shortDescription}</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Price price={p.price} compareAt={p.compareAtPrice} size="lg" />
              <Rating value={p.rating} count={p.reviewCount} href="#reviews" />
            </div>
            <p className="mt-1.5 text-[11.5px] text-faint">MRP inclusive of all taxes</p>
            {(p.isLimitedEdition || p.isNew) && (
              <p className="mt-5 inline-flex items-center gap-2 border border-line px-3 py-1.5 text-[11px] uppercase tracking-[0.14em]">
                {p.isLimitedEdition ? "Limited Edition · Numbered run" : "New Season"}
              </p>
            )}

            <div className="mt-8 border-t border-line pt-6">
              <p className="label-sm">
                Colour: <span className="font-normal normal-case tracking-normal text-muted">{color}</span>
              </p>
              <ColorSwatches
                colors={p.colors}
                value={color}
                size="lg"
                className="mt-4"
                onChange={(c) => {
                  setColor(c);
                  const u = new URL(window.location.href);
                  u.searchParams.set("color", c);
                  window.history.replaceState(null, "", u);
                }}
              />
            </div>

            {p.sizes.length > 1 || p.sizes[0] !== "One Size" ? (
              <div id="size-select" className="mt-7">
                <div className="mb-4 flex items-center justify-between">
                  <p className="label-sm">{size ? <>Size: <span className="font-normal normal-case tracking-normal text-muted">{size}</span></> : "Select Your Size"}</p>
                  <div className="flex items-center gap-4">
                    <FindMySize
                      product={p}
                      onPick={(s) => {
                        setSize(s);
                        setSizeError(false);
                      }}
                    />
                    {(
                      <button type="button" onClick={() => openSizeGuide(p.category)} className="flex items-center gap-1.5 text-[12px] link-static">
                        <Ruler size={14} /> Size Guide
                      </button>
                    )}
                  </div>
                </div>
                <SizeSelector
                  sizes={p.sizes}
                  value={size}
                  error={sizeError}
                  stockFor={stockFor}
                  onChange={(s) => {
                    setSize(s);
                    setSizeError(false);
                  }}
                />
                <div aria-live="polite" className="mt-3 min-h-[20px] text-[12.5px]">
                  {sizeError ? (
                    <span className="text-error">Please select a size.</span>
                  ) : selectedOut ? (
                    <span className="text-muted">This size is out of stock — we can notify you when it returns.</span>
                  ) : selectedStock !== null && selectedStock <= 5 ? (
                    <span className="font-semibold uppercase tracking-[0.12em] text-warning">Only {selectedStock} left</span>
                  ) : p.modelInfo ? (
                    <span className="text-muted">{p.modelInfo}</span>
                  ) : null}
                </div>
                {cat && chartForCategory(p.category) === "tops" && p.fit !== "One Size" && (
                  <p className="mt-1 text-[12px] text-muted">
                    Fit: <span className="text-ink">{p.fit}</span> · {p.fit === "Oversized" || p.fit === "Relaxed" ? "Size down for a closer fit." : "True to size."}
                  </p>
                )}
              </div>
            ) : (
              allOut || selectedOut ? null : stockFor(p.sizes[0]) <= 5 && <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-warning">Only {stockFor(p.sizes[0])} left</p>
            )}

            <div ref={ctaRef} className="mt-7 space-y-3">
              <button type="button" onClick={add} disabled={adding} className={cn("btn btn-block", allOut || selectedOut ? "btn-outline" : "btn-primary")}>
                {!(allOut || selectedOut) && <BagIcon size={16} />}
                <span>{ctaLabel}</span>
              </button>
              <WishlistButton productId={p.id} name={p.name} variant="button" />
            </div>
            {allOut && <p className="mt-3 text-[12.5px] text-muted">This colour is currently sold out. Choose another colour or ask to be notified.</p>}

            <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-6 text-[12.5px] text-charcoal">
              <li className="flex items-center gap-2.5"><Lock size={15} /> Secure Payment</li>
              <li className="flex items-center gap-2.5"><ReturnIcon size={16} /> Easy {commerce.returnWindowDays}-Day Returns</li>
              <li className="flex items-center gap-2.5"><Shield size={16} /> Quality Checked</li>
              <li className="flex items-center gap-2.5"><Gift size={16} /> Premium Packaging</li>
            </ul>
            <p className="mt-4 text-[12.5px] text-muted">
              {p.price >= commerce.freeShippingThreshold ? "Complimentary shipping on this piece." : `Complimentary shipping on orders above ${formatINR(commerce.freeShippingThreshold)}.`}
            </p>

            <FabricViewer materials={p.materials} name={p.name} colorHex={p.colors.find((c) => c.name === color)?.hex} />

            <div className="mt-6">
              <PincodeChecker />
            </div>

            <div className="mt-8 border-t border-line">
              <AccordionItem title="Product Details" defaultOpen>
                <p className="mb-4">{p.description}</p>
                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <span className="mt-[11px] h-px w-2.5 shrink-0 bg-muted" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[12px] text-faint">Style code: {p.sku}</p>
              </AccordionItem>
              <AccordionItem title="Fabric & Composition">
                <p className="mb-3">{p.materials}</p>
                <ul className="space-y-1.5">
                  {p.composition.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </AccordionItem>
              <AccordionItem title="Fit & Sizing">
                <p>
                  {p.fit} fit. {p.modelInfo}
                </p>
                <p className="mt-2">
                  {p.ratingBreakdown.fit >= 4.7 ? "Customers say this runs true to size." : "Some customers suggest sizing up if between sizes."}{" "}
                  {(
                    <button type="button" onClick={() => openSizeGuide(p.category)} className="link-static">
                      View the size guide
                    </button>
                  )}
                </p>
              </AccordionItem>
              <AccordionItem title="Care Guide">
                <ul className="space-y-1.5">
                  {p.careInstructions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </AccordionItem>
              <AccordionItem title="Shipping">
                <p>Complimentary standard shipping on orders above {formatINR(commerce.freeShippingThreshold)} (otherwise {formatINR(commerce.standardShipping)}). Delivered in 2–4 working days to metro cities and 4–7 elsewhere. Express delivery available in select cities for {formatINR(commerce.expressShipping)}.</p>
                <Link href="/shipping" className="mt-2 inline-block link-static">Shipping information</Link>
              </AccordionItem>
              <AccordionItem title="Returns & Exchanges">
                <p>Return unworn pieces with tags within {commerce.returnWindowDays} days of delivery. We collect from your door for free. Exchanges are always complimentary.{p.isLimitedEdition ? " Limited Edition pieces are eligible for size exchange only." : ""}</p>
                <Link href="/returns" className="mt-2 inline-block link-static">Our returns policy</Link>
              </AccordionItem>
              <AccordionItem title="Sustainability">
                <p>Made in small runs to avoid overproduction, by manufacturing partners we audit in person. Shipped in recyclable, plastic-free packaging. Every piece is built to be worn — and repaired — for years.</p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {children}

      {/* Mobile sticky CTA */}
      <div className={cn("fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/[0.97] px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-md transition-transform duration-500 ease-[var(--ease-lux)] md:hidden", ctaVisible ? "translate-y-full" : "translate-y-0")}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px]">{p.name}</p>
            <p className="text-[12px] text-muted">
              {formatINR(p.price)} · {color}
              {size ? ` · ${size}` : ""}
            </p>
          </div>
          <button type="button" onClick={add} className={cn("btn btn-sm h-12 shrink-0", allOut || selectedOut ? "btn-outline" : "btn-primary")}>
            {size ? ctaLabel : "Select Size"}
            {!size && <ArrowRight size={13} />}
          </button>
        </div>
      </div>

      <NotifyMe open={notify} onClose={() => setNotify(false)} product={p} color={color} size={size} />
    </>
  );
}
