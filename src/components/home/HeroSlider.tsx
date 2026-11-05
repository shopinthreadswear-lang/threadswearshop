"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";
import { IMG } from "@/data/images";

type Slide = { eyebrow: string; title: [string, string]; cta: string; href: string; img: string; alt: string; focus: string; field?: boolean };

const SLIDES: Slide[] = [
  { eyebrow: "Urban Edge", title: ["Jackets for the", "Modern Man"], cta: "Discover Now", href: "/men/jackets", img: IMG.manStripedOverDenim, alt: "Man in a denim overshirt and striped tee against a blue sky", focus: "50% 18%", field: true },
  { eyebrow: "Modern Tailoring", title: ["Suits That Mean", "Business"], cta: "Shop Tailoring", href: "/men/designer-wear", img: IMG.heroNavy, alt: "Man buttoning a navy suit jacket", focus: "50% 32%" },
  { eyebrow: "Everyday Essentials", title: ["Heavyweight Tees,", "Built to Last"], cta: "Shop T-Shirts", href: "/men/t-shirts", img: IMG.manHat, alt: "Man in a black tee and hat against a terracotta wall", focus: "60% 30%" },
];

const AUTOPLAY_MS = 6000;

/** Full-bleed campaign slider under a transparent header: arrows, swipe and a gentle auto-advance that pauses on hover. */
export function HeroSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const go = useCallback((d: number) => setI((x) => (x + d + SLIDES.length) % SLIDES.length), []);
  const [startX, setStartX] = useState<number | null>(null);
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [i, paused, reduce, go]);

  // Fetch the other slides once the page has settled, so changing slide never shows an empty frame.
  useEffect(() => {
    const t = setTimeout(() => setWarm(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const s = SLIDES[i];
  const arrow = "absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream text-ink shadow-[0_4px_16px_rgb(0_0_0/0.12)] transition-transform duration-300 hover:scale-105 active:scale-95";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative -mt-[var(--hdr)] h-[86svh] min-h-[540px] touch-pan-y overflow-hidden bg-denim text-cream md:h-[min(92svh,900px)] md:min-h-[600px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={(e) => setStartX(e.clientX)}
      onPointerUp={(e) => {
        if (startX !== null && Math.abs(e.clientX - startX) > 50) go(e.clientX < startX ? 1 : -1);
        setStartX(null);
      }}
    >
      {warm && (
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0">
          {SLIDES.map((x) => (
            <Image key={x.img} src={x.img} alt="" fill loading="eager" sizes="100vw" className="object-cover" />
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        <motion.div key={i} className="absolute inset-0 bg-denim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.8 }}>
          {s.field ? (
            // A portrait shot, so it stands on the right of a denim-blue field and melts into it.
            <div className="absolute inset-y-0 right-0 w-full md:w-[62%] lg:w-[54%] md:[mask-image:linear-gradient(to_right,transparent,#000_30%)]">
              <Image src={s.img} alt={s.alt} fill priority={i === 0} sizes="(max-width:768px) 100vw, 60vw" className="object-cover" style={{ objectPosition: s.focus }} />
            </div>
          ) : (
            <Image src={s.img} alt={s.alt} fill priority={i === 0} sizes="100vw" className="object-cover" style={{ objectPosition: s.focus }} />
          )}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgb(20_32_46/0.5),rgb(20_32_46/0.08)_60%),linear-gradient(to_bottom,rgb(20_32_46/0.34),transparent_22%)] max-md:bg-[linear-gradient(to_top,rgb(20_32_46/0.72),rgb(20_32_46/0.06)_62%),linear-gradient(to_bottom,rgb(20_32_46/0.38),transparent_20%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="container-site relative flex h-full flex-col justify-end pb-16 md:justify-center md:pb-0 md:pl-[max(var(--spacing-gutter),5.5rem)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={i} initial={{ y: reduce ? 0 : 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            <p className="eyebrow text-cream">{s.eyebrow}</p>
            <h1 className="display-xl mt-4">
              {s.title[0]}
              <br />
              {s.title[1]}
            </h1>
            <Link href={s.href} className="btn btn-light mt-8">
              {s.cta}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className={`${arrow} left-4 max-md:hidden md:left-6`}>
        <ChevronLeft size={15} />
      </button>
      <button type="button" onClick={() => go(1)} aria-label="Next slide" className={`${arrow} right-4 max-md:hidden md:right-6`}>
        <ChevronRight size={15} />
      </button>

      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 md:hidden">
        {SLIDES.map((x, k) => (
          <button key={x.href} type="button" onClick={() => setI(k)} aria-label={`Show slide ${k + 1} of ${SLIDES.length}`} aria-current={k === i} className="hit h-1.5 w-1.5 rounded-full bg-cream transition-[width,opacity] duration-300 aria-[current=false]:opacity-50 aria-[current=true]:w-5" />
        ))}
      </div>
    </section>
  );
}
