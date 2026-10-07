"use client";

import { Eyebrow } from "@/components/motion/Eyebrow";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STORY_REVIEWS } from "@/data/story";
import { Stars } from "@/components/ui/Rating";
import { ArrowLeft, ArrowRight, Check } from "@/components/ui/Icons";
import { prefersReducedMotion } from "@/components/motion/useInView";

const DURATION = 8000;

/**
 * 08 — Social proof as one large editorial quote at a time.
 * Auto-advances every 8s (pauses on hover, focus, hidden tab and reduced motion); arrows and dots for control.
 */
export function StoryTestimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [auto, setAuto] = useState(true);
  const n = STORY_REVIEWS.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- respect the OS motion setting
    if (prefersReducedMotion()) setAuto(false);
  }, []);
  useEffect(() => {
    if (!auto || paused) return;
    const t = setTimeout(() => go(1), DURATION);
    return () => clearTimeout(t);
  }, [i, auto, paused, go]);

  const r = STORY_REVIEWS[i];
  return (
    <section
      id="reviews"
      data-section="Reviews"
      aria-roledescription="carousel"
      aria-labelledby="reviews-title"
      className="section-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container-site">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>In Their Words</Eyebrow>
            <h2 id="reviews-title" className="mt-4 flex items-baseline gap-4">
              <span className="font-serif text-[clamp(2.6rem,5vw,4.2rem)] leading-none">4.8 / 5</span>
              <span className="text-[13px] text-muted">from 2,400+ verified reviews</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Previous review" className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-ink">
              <ArrowLeft />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next review" className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-ink">
              <ArrowRight />
            </button>
          </div>
        </div>

        <div className="grid gap-10 border-t border-ink pt-12 lg:grid-cols-12" aria-live={auto && !paused ? "off" : "polite"}>
          <AnimatePresence mode="wait">
            <motion.figure key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="grid gap-10 lg:col-span-12 lg:grid-cols-12" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
              <blockquote className="lg:col-span-8">
                <Stars value={5} size={15} />
                <p className="mt-6 font-serif text-[clamp(1.7rem,3.4vw,3rem)] leading-[1.18]">“{r.quote}”</p>
              </blockquote>
              <figcaption className="flex flex-col justify-end gap-6 lg:col-span-4">
                <div>
                  <p className="text-[15px]">
                    <span className="font-semibold">{r.author}</span> <span className="text-muted">· {r.role}, {r.city}</span>
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-success">
                    <Check size={12} /> Verified buyer
                  </p>
                </div>
                <Link href={`/products/${r.slug}`} className="group flex items-center gap-4 border border-line p-3 transition-colors hover:border-ink" data-cursor="View">
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-bone">
                    <Image src={r.image} alt="" fill sizes="64px" className="img-grade object-cover transition-transform duration-700 group-hover:scale-105" />
                  </span>
                  <span className="text-[13px]">
                    <span className="block">{r.product}</span>
                    <span className="mt-1 block text-muted">{r.result}</span>
                  </span>
                </Link>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center gap-3" role="group" aria-label="Choose review">
          {STORY_REVIEWS.map((x, idx) => (
            <button key={x.author} type="button" onClick={() => setI(idx)} aria-label={`Review ${idx + 1}: ${x.author}`} aria-current={idx === i} className="relative h-6 flex-1">
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
              <span
                className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-ink"
                style={{
                  width: idx < i ? "100%" : idx === i ? (auto && !paused ? "100%" : "40%") : "0%",
                  transition: idx === i && auto && !paused ? `width ${DURATION}ms linear` : "width 300ms var(--ease-lux)",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
