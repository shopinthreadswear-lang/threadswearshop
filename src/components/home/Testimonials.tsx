"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { featuredReviews } from "@/data/reviews";
import { getProduct, imagesFor } from "@/data/products";
import { ArrowLeft, ArrowRight, Star } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

const TONES = ["bg-ochre text-ink", "bg-burgundy text-cream"];

function Card({ r, tone }: { r: (typeof featuredReviews)[number]; tone: string }) {
  return (
    <figure className={cn("flex min-h-[300px] flex-col rounded-[22px] p-7 md:min-h-[340px] md:p-9", tone)}>
      <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.1em]">
        <span className="flex gap-0.5" aria-label="Rated 5 out of 5">
          {Array.from({ length: 5 }, (_, k) => (
            <Star key={k} size={12} />
          ))}
        </span>
        <span>{r.author}</span>
      </div>
      <blockquote className="mt-6 flex-1 font-serif text-[19px] font-semibold leading-[1.4] md:text-[21px]">“{r.quote}”</blockquote>
      <figcaption className="mt-6 text-[11px] font-bold uppercase tracking-[0.1em] opacity-80">
        {r.city} · {r.product}
      </figcaption>
    </figure>
  );
}

/** Two notes from customers either side of the piece they wrote about. */
export function Testimonials() {
  const [[i, dir], setState] = useState<[number, number]>([0, 1]);
  const n = featuredReviews.length;
  const a = featuredReviews[i];
  const b = featuredReviews[(i + 1) % n];
  const p = getProduct(a.slug);
  const go = (d: number) => setState(([x]) => [(x + d + n) % n, d]);
  // Variants take the direction as `custom`, so a leaving card exits the way the reader paged, not the way it arrived.
  const card = (delay: number) => ({
    custom: dir,
    initial: "enter",
    animate: "center",
    exit: "exit",
    variants: {
      enter: (d: number) => ({ x: d * 90, rotate: d * 6, opacity: 0, scale: 0.94 }),
      center: { x: 0, rotate: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 170, damping: 20, delay } },
      exit: (d: number) => ({ x: d * -90, rotate: d * -5, opacity: 0, scale: 0.96, transition: { duration: 0.25, delay: delay / 2 } }),
    },
  });
  const arrow = "grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-burgundy text-burgundy transition-colors duration-300 hover:bg-burgundy hover:text-cream";

  return (
    <section aria-labelledby="notes-title" className="overflow-x-clip py-20 md:py-28">
      <div className="container-site">
        <SectionTitle id="notes-title" title="Notes from the" accent="fitting room" sub="What customers say after a few months of wear." />
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8 lg:gap-12" aria-live="polite">
          <div className="grid">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div key={`a${i}`} className="[grid-area:1/1]" {...card(0)}>
                <Card r={a} tone={TONES[0]} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="relative mx-auto hidden w-40 md:block lg:w-52">
            {p && (
              <motion.div key={p.id} initial={{ scale: 0.6, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] shadow-[0_24px_40px_-24px_rgb(62_33_23/0.55)]">
                  <Image src={imagesFor(p)[0]} alt={p.name} fill sizes="208px" className="object-cover" />
                </div>
              </motion.div>
            )}
          </div>
          <div className="grid max-md:hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div key={`b${i}`} className="[grid-area:1/1]" {...card(0.08)}>
                <Card r={b} tone={TONES[1]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(-1)} aria-label="Previous review" className={arrow}>
            <ArrowLeft size={15} />
          </button>
          <span className="text-[12px] tabular-nums text-muted">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Next review" className={arrow}>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
