"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getProductById, imagesFor, variantStock } from "@/data/products";
import { useStore } from "@/components/providers/StoreProvider";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { formatINR } from "@/lib/site";
import { flyToBag } from "@/lib/fly";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

const SIZES = ["S", "M", "L", "XL"];
const LAYERS = [
  { key: "outer", label: "Outer layer", tilt: -3, pos: "left-[2%] top-[4%] w-[52%]", z: 1 },
  { key: "mid", label: "Shirt or knit", tilt: 2, pos: "right-[2%] top-[14%] w-[50%]", z: 2 },
  { key: "base", label: "The tee", tilt: -1, pos: "left-[22%] bottom-[2%] w-[46%]", z: 3 },
] as const;

/** First colour that has the size in stock, so "add the look" never adds a sold-out variant. */
function colourFor(p: Product, size: string) {
  return p.colors.find((c) => variantStock(p, c.name, size) > 0)?.name;
}

/**
 * Outfit builder: flip through three layers, shuffle for ideas, pick one size, and put the whole look in the bag.
 * The preview stacks the three pieces like photos pinned on a board.
 */
export function LookBuilder({ outer, mid, base }: { outer: string[]; mid: string[]; base: string[] }) {
  const lists = { outer, mid, base } as Record<(typeof LAYERS)[number]["key"], string[]>;
  const [idx, setIdx] = useState({ outer: 0, mid: 0, base: 0 });
  const [dir, setDir] = useState<Record<string, number>>({ outer: 1, mid: 1, base: 1 });
  const [size, setSize] = useState("M");
  const [busy, setBusy] = useState(false);
  const [shuffles, setShuffles] = useState(0);
  const board = useRef<HTMLDivElement>(null);
  const { addToCart, toast, setCartOpen } = useStore();

  const pick = Object.fromEntries(LAYERS.map((l) => [l.key, getProductById(lists[l.key][idx[l.key]])!])) as Record<string, Product>;
  const pieces = LAYERS.map((l) => pick[l.key]);
  const total = pieces.reduce((a, p) => a + p.price, 0);
  const avail = pieces.map((p) => colourFor(p, size));
  const missing = pieces.filter((_, i) => !avail[i]);

  const step = (k: string, d: number) => {
    const n = lists[k as keyof typeof lists].length;
    setDir((x) => ({ ...x, [k]: d }));
    setIdx((x) => ({ ...x, [k]: (x[k as keyof typeof x] + d + n) % n }));
  };
  const shuffle = () => {
    setShuffles((s) => s + 1);
    setDir({ outer: 1, mid: -1, base: 1 });
    setIdx((x) => {
      const next = { ...x };
      for (const l of LAYERS) {
        const n = lists[l.key].length;
        let r = Math.floor(Math.random() * n);
        if (n > 1 && r === x[l.key]) r = (r + 1) % n;
        next[l.key] = r;
      }
      return next;
    });
  };
  const addLook = async () => {
    if (busy || missing.length === pieces.length) return;
    setBusy(true);
    await flyToBag(board.current, imagesFor(pieces[0])[0]);
    pieces.forEach((p, i) => avail[i] && addToCart({ productId: p.id, color: avail[i]!, size }, { silent: true }));
    const added = pieces.length - missing.length;
    toast(missing.length ? `${added} of 3 pieces added — ${missing.map((p) => p.name).join(", ")} is out in ${size}` : `The look is in your bag · size ${size}`, { tone: "success" });
    setBusy(false);
    setCartOpen(true);
  };

  return (
    <section aria-labelledby="builder-title" className="relative overflow-x-clip border-t border-line bg-paper py-20 md:py-28">
      <div className="container-site">
        <SectionTitle id="builder-title" title="Build" accent="the look" sub="Pick an outer layer, a shirt and a tee — or shuffle. One size, one tap, the whole outfit in your bag." />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* The board */}
          <div ref={board} className="relative mx-auto aspect-[1/1.05] w-full max-w-[560px]" aria-hidden>
            {LAYERS.map((l) => {
              const p = pick[l.key];
              return (
                <div key={l.key} className={cn("absolute z-[var(--z)] hover:z-10", l.pos)} style={{ "--z": l.z } as React.CSSProperties}>
                  <AnimatePresence mode="popLayout" initial={false} custom={dir[l.key]}>
                    <motion.div
                      key={p.id + shuffles}
                      custom={dir[l.key]}
                      variants={{
                        enter: (d: number) => ({ x: d * 60, y: 0, rotate: l.tilt, opacity: 0, scale: 0.94, filter: "blur(10px)" }),
                        center: { x: 0, y: 0, rotate: l.tilt, opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                        exit: (d: number) => ({ x: d * -60, rotate: l.tilt, opacity: 0, scale: 0.96, filter: "blur(10px)", transition: { duration: 0.3 } }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      whileHover={{ scale: 1.04, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 18 } }}
                      className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-bone shadow-[0_26px_44px_-26px_rgb(62_33_23/0.55)]"
                    >
                      <Image src={imagesFor(p)[0]} alt="" fill sizes="(max-width:1024px) 50vw, 280px" className="object-cover" />
                      <span className="absolute bottom-2.5 left-2.5 rounded-full bg-ivory/95 px-2.5 py-1 text-[11px] font-bold text-burgundy">{formatINR(p.price)}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* The controls */}
          <div className="min-w-0">
            <ol className="divide-y divide-line border-y border-line">
              {LAYERS.map((l, i) => {
                const p = pick[l.key];
                const n = lists[l.key].length;
                return (
                  <li key={l.key} className="flex items-center gap-3 py-4 sm:gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-burgundy text-[12px] text-burgundy">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">{l.label}</p>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.p key={p.id} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.22 }} className="line-clamp-2 font-serif text-[17px] leading-snug sm:truncate md:text-[21px]">
                          <Link href={`/products/${p.slug}`} className="link-u hit">
                            {p.name}
                          </Link>
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button type="button" onClick={() => step(l.key, -1)} aria-label={`Previous ${l.label.toLowerCase()}`} className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-burgundy hover:text-burgundy active:scale-95">
                        <ArrowLeft size={14} />
                      </button>
                      <span className="hidden w-10 text-center text-[11px] tabular-nums text-muted sm:inline" aria-hidden>
                        {idx[l.key] + 1}/{n}
                      </span>
                      <button type="button" onClick={() => step(l.key, 1)} aria-label={`Next ${l.label.toLowerCase()}`} className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-burgundy hover:text-burgundy active:scale-95">
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
              <div role="radiogroup" aria-label="Your size" className="flex items-center gap-2">
                <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Size</span>
                {SIZES.map((s) => (
                  <button key={s} type="button" role="radio" aria-checked={size === s} onClick={() => setSize(s)} className={cn("grid h-11 min-w-11 place-items-center rounded-full border px-3 text-[12px] transition-colors", size === s ? "border-burgundy bg-burgundy text-cream" : "border-line hover:border-burgundy")}>
                    {s}
                  </button>
                ))}
              </div>
              <motion.button type="button" onClick={shuffle} whileTap={{ rotate: -20, scale: 0.92 }} className="hit group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.1em] text-burgundy">
                <motion.span key={shuffles} initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="grid h-9 w-9 place-items-center rounded-full bg-ochre text-[16px] text-burgundy">
                  ⟳
                </motion.span>
                Shuffle
              </motion.button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-[22px] bg-burgundy p-6 text-cream md:p-7">
              <div aria-live="polite">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-cream/75">The look, together</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p key={total} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.22 }} className="font-serif text-[30px] leading-tight">
                    {formatINR(total)}
                  </motion.p>
                </AnimatePresence>
                {missing.length > 0 && <p className="mt-1 text-[11.5px] text-champagne-soft">{missing.map((p) => p.name).join(", ")} is sold out in {size}</p>}
              </div>
              <button type="button" onClick={addLook} disabled={busy || missing.length === pieces.length} className="btn btn-light">
                {busy ? "Adding…" : "Add the look"} <ArrowRight size={14} className="btn-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
