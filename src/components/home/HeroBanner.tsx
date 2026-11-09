"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "@/components/ui/Icons";
import { getProduct } from "@/data/products";
import { IMG } from "@/data/images";
import { formatINR } from "@/lib/site";

const LOOKS = [
  { img: IMG.manHat, alt: "Man in a black heavyweight tee and hat", focus: "58% 28%", title: ["The shirt you’ll", "reach for first"], sub: "Heavyweight cotton · cut in Mumbai", slug: "mercer-heavyweight-tee", href: "/men/t-shirts" },
  { img: IMG.manBrownJacket, alt: "Man in a tobacco overshirt and white tee", focus: "55% 28%", title: ["Layers with", "a bit of nerve"], sub: "Overshirts, suede and denim", slug: "camden-overshirt", href: "/men/jackets" },
  { img: IMG.heroNavy, alt: "Man buttoning a navy suit jacket", focus: "50% 32%", title: ["Tailoring", "that means it"], sub: "Half-canvassed · alterations included", slug: "savoy-two-piece-suit", href: "/men/designer-wear" },
];
const AUTOPLAY_MS = 6500;

/**
 * Brand-colour hero: each look is printed as a duotone on oxblood, with one big centred line, a price tag
 * that pops beside the piece, and round arrows bottom-left. Slides arrive with a horizontal motion blur.
 */
export function HeroBanner() {
  const reduce = useReducedMotion();
  const [[i, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const [warm, setWarm] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const go = useCallback((d: number) => setState(([x]) => [(x + d + LOOKS.length) % LOOKS.length, d]), []);
  const look = LOOKS[i];
  const product = getProduct(look.slug);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [i, paused, reduce, go]);
  // Fetch the other looks after the page settles, so a slide never arrives as an empty frame.
  useEffect(() => {
    const t = setTimeout(() => setWarm(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured looks"
      className="relative -mt-[var(--hdr)] h-[88svh] min-h-[560px] touch-pan-y overflow-hidden bg-burgundy text-cream md:h-[min(94svh,920px)] md:min-h-[640px]"
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
          {LOOKS.map((l) => (
            <Image key={l.img} src={l.img} alt="" fill loading="eager" sizes="100vw" className="object-cover" />
          ))}
        </div>
      )}

      {/* The photo, printed in the brand colour */}
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={i}
          custom={dir}
          className="absolute inset-0"
          variants={{
            enter: (d: number) => ({ x: reduce ? 0 : `${d * 14}%`, opacity: 0, filter: reduce ? "none" : "blur(18px)" }),
            center: { x: "0%", opacity: 1, filter: "blur(0px)", transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] } },
            exit: (d: number) => ({ x: reduce ? 0 : `${d * -10}%`, opacity: 0, filter: reduce ? "none" : "blur(14px)", transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <Image src={look.img} alt={look.alt} fill priority={i === 0} sizes="100vw" className="object-cover opacity-[0.62] mix-blend-luminosity grayscale-[0.2]" style={{ objectPosition: look.focus }} />
        </motion.div>
      </AnimatePresence>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_30%,rgb(46_10_16/0.55)_100%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgb(46_10_16/0.5)] to-transparent" />

      {/* Centred line */}
      <div className="container-site relative flex h-full flex-col items-center justify-end pb-28 text-center md:justify-center md:pb-0 md:pt-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={i} initial="hide" animate="show" exit="out" variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}>
            <h1 className="display-xl drop-shadow-[0_4px_24px_rgb(46_10_16/0.45)]">
              {look.title.map((line) => (
                <span key={line} className="block overflow-hidden pb-[0.04em]">
                  <motion.span className="block" variants={{ hide: { y: reduce ? 0 : "105%" }, show: { y: "0%", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }, out: { y: reduce ? 0 : "-105%", transition: { duration: 0.35, ease: [0.65, 0, 0.35, 1] } } }}>
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p className="mt-4 text-[11.5px] font-bold uppercase tracking-[0.32em] text-cream/85" variants={{ hide: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 }, out: { opacity: 0 } }}>
              {look.sub}
            </motion.p>
            <motion.div className="mt-8" variants={{ hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 }, out: { opacity: 0 } }}>
              <Link href={look.href} className="btn btn-dark">
                Shop now <ArrowRight size={13} className="btn-arrow" />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Price tag that pops beside the piece */}
      <AnimatePresence mode="wait" initial={false}>
        {product && (
          <motion.div key={i} className="absolute right-[8%] top-[24%] hidden md:block lg:right-[16%]" initial={{ scale: 0.4, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: -4, transition: { type: "spring", stiffness: 320, damping: 15, delay: 0.55 } }} exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.2 } }}>
            <Link href={`/products/${product.slug}`} className="relative block rounded-full bg-cream px-5 py-2.5 text-center text-burgundy shadow-[0_14px_30px_-12px_rgb(0_0_0/0.5)] transition-transform duration-300 hover:scale-105">
              <span className="block font-serif text-[22px] font-extrabold leading-none">{formatINR(product.price)}</span>
              <span className="mt-1 block max-w-[11rem] truncate text-[10.5px] font-bold uppercase tracking-[0.08em] text-charcoal">{product.name.replace(/^The /, "")}</span>
              <span aria-hidden className="absolute -bottom-1.5 left-6 h-4 w-4 rotate-45 rounded-[3px] bg-cream" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Round arrows, bottom-left */}
      <div className="absolute bottom-7 left-[var(--spacing-gutter)] flex items-center gap-2.5 md:bottom-10">
        <button type="button" onClick={() => go(-1)} aria-label="Previous look" className="grid h-11 w-11 place-items-center rounded-full bg-ink text-cream transition-transform duration-300 hover:-translate-x-0.5 active:scale-90">
          <ChevronLeft size={15} />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next look" className="grid h-11 w-11 place-items-center rounded-full bg-cream/20 text-cream backdrop-blur-sm transition-[transform,background-color] duration-300 hover:translate-x-0.5 hover:bg-cream/30 active:scale-90">
          <ChevronRight size={15} />
        </button>
        <span className="ml-2 font-mono text-[11px] font-bold tabular-nums tracking-[0.1em] text-cream/80" aria-live="polite">
          {String(i + 1).padStart(2, "0")} / {String(LOOKS.length).padStart(2, "0")}
        </span>
      </div>
      {/* Autoplay progress */}
      {!reduce && (
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-cream/15">
          <motion.div key={`${i}-${paused}`} className="h-full origin-left bg-ochre" initial={{ scaleX: 0 }} animate={{ scaleX: paused ? 0 : 1 }} transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }} />
        </div>
      )}
    </section>
  );
}
