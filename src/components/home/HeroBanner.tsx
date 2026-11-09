"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "@/components/ui/Icons";
import { getProduct } from "@/data/products";
import { IMG } from "@/data/images";
import { formatINR } from "@/lib/site";
import { cn } from "@/lib/cn";

const LOOKS = [
  { img: IMG.teeWhiteModel2, alt: "Man in a white crew-neck tee against a warm wall", focus: "50% 30%", tag: "Supima cotton for every day", title: ["Everyday", "collection"], slug: "arden-supima-crew", href: "/men/t-shirts" },
  { img: IMG.teeCharcoalModel, alt: "Man in a charcoal heavyweight tee and jeans", focus: "50% 30%", tag: "Heavyweight cotton, cut in Mumbai", title: ["Heavyweight", "collection"], slug: "mercer-heavyweight-tee", href: "/men/t-shirts" },
  { img: IMG.manWhiteShirt, alt: "Man in a crisp white shirt and sunglasses", focus: "50% 25%", tag: "Oxford and poplin, pressed and ready", title: ["Shirting", "collection"], slug: "kensington-oxford-shirt", href: "/men/shirts" },
];
const AUTOPLAY_MS = 6500;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Studio hero: a calm cream backdrop, the model on the right melting into it, and a big two-line title with one
 * button on the left. Looks cross-fade with a slow push-in; a round price tag floats beside the piece.
 */
export function HeroBanner() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [warm, setWarm] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const go = useCallback((d: number) => setI((x) => (x + d + LOOKS.length) % LOOKS.length), []);
  const look = LOOKS[i];
  const product = getProduct(look.slug);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);

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
      ref={ref}
      aria-roledescription="carousel"
      aria-label="Featured looks"
      className="relative touch-pan-y overflow-hidden bg-bone text-ink lg:h-[min(calc(100svh-var(--hdr)),820px)] lg:min-h-[580px]"
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
        <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
          {LOOKS.map((l) => (
            <Image key={l.img} src={l.img} alt="" width={900} height={1100} loading="eager" sizes="(max-width:1024px) 100vw, 60vw" />
          ))}
        </div>
      )}

      {/* The photo: full width on phones, the right side on large screens, fading into the backdrop */}
      <div className="relative aspect-[4/4.4] w-full overflow-hidden sm:aspect-[16/12] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[60%]">
        <motion.div className="absolute inset-0" style={{ y: photoY }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 1, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 1, ease: EASE } }}
            >
              <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.12 }} animate={{ scale: 1, transition: { duration: 7, ease: "linear" } }}>
                <Image src={look.img} alt={look.alt} fill priority={i === 0} sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" style={{ objectPosition: look.focus }} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {/* Melt into the backdrop: left edge on desktop, bottom edge on phones */}
        <div aria-hidden className="absolute inset-y-0 left-0 hidden w-[38%] bg-gradient-to-r from-bone via-bone/60 to-transparent lg:block" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-bone via-bone/70 to-transparent lg:hidden" />
      </div>

      {/* Round price tag, floating beside the piece */}
      <AnimatePresence mode="wait" initial={false}>
        {product && (
          <motion.div
            key={i}
            className="absolute right-4 top-4 z-20 sm:right-8 sm:top-8 lg:right-[7%] lg:top-[12%]"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 16, delay: 0.5 } }}
            exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.2 } }}
          >
            <Link
              href={`/products/${product.slug}`}
              aria-label={`${product.name}, ${formatINR(product.price)}`}
              className="grid h-[88px] w-[88px] animate-[bob_5s_ease-in-out_infinite] place-items-center rounded-full bg-paper/90 text-center shadow-[0_18px_40px_-18px_rgb(62_33_23/0.55)] backdrop-blur-sm transition-transform duration-300 hover:scale-105 motion-reduce:animate-none sm:h-[112px] sm:w-[112px]"
            >
              <span>
                <span className="block text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">From</span>
                <span className="block font-serif text-[17px] font-extrabold leading-tight text-burgundy sm:text-[20px]">{formatINR(product.price)}</span>
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The words */}
      <motion.div style={{ y: textY }} className="container-site relative z-10 -mt-[22%] pb-8 text-center sm:-mt-[14%] sm:pb-12 lg:mt-0 lg:flex lg:h-full lg:items-center lg:pb-0 lg:text-left">
        <div className="lg:w-[46%] lg:pl-[2%]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={i} initial="hide" animate="show" exit="out" variants={{ show: { transition: { staggerChildren: 0.08 } }, out: { transition: { staggerChildren: 0.03 } } }}>
              <motion.p
                className="text-[11.5px] font-semibold tracking-[0.04em] text-muted sm:text-[13px]"
                variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }, out: { opacity: 0, transition: { duration: 0.2 } } }}
              >
                {look.tag}
              </motion.p>
              <h1 className="mt-2 font-serif text-[clamp(2.4rem,9.5vw,3.6rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.02em] text-burgundy sm:text-[clamp(3rem,7vw,4.4rem)] lg:text-[clamp(3.2rem,5.4vw,5.6rem)]">
                {look.title.map((line, n) => (
                  <span key={line + n} className="block overflow-hidden pb-[0.04em]">
                    <motion.span
                      className="block"
                      variants={{
                        hide: { y: reduce ? 0 : "105%", opacity: reduce ? 0 : 1 },
                        show: { y: "0%", opacity: 1, transition: { duration: 0.75, ease: EASE } },
                        out: { y: reduce ? 0 : "-105%", opacity: reduce ? 0 : 1, transition: { duration: 0.35, ease: [0.65, 0, 0.35, 1] } },
                      }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
            </motion.div>
          </AnimatePresence>

          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.35 } }} className="mt-6 sm:mt-8">
            <Link href={look.href} className="btn btn-primary">
              Shop collection <ArrowRight size={13} className="btn-arrow" />
            </Link>
          </motion.div>

          {/* Controls */}
          <div className="mt-7 flex items-center justify-center gap-4 lg:mt-12 lg:justify-start">
            <button type="button" onClick={() => go(-1)} aria-label="Previous look" className="grid h-10 w-10 place-items-center rounded-full border border-burgundy/30 text-burgundy transition-[transform,background-color,color] duration-300 hover:bg-burgundy hover:text-cream active:scale-90">
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-2">
              {LOOKS.map((l, n) => (
                <button key={l.slug} type="button" aria-current={n === i} aria-label={`Show look ${n + 1}: ${l.title.join(" ")}`} onClick={() => setI(n)} className="grid h-11 min-w-6 place-items-center">
                  <span className={cn("block h-[5px] rounded-full transition-all duration-500", n === i ? "w-8 bg-burgundy" : "w-[5px] bg-burgundy/30")} />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => go(1)} aria-label="Next look" className="grid h-10 w-10 place-items-center rounded-full bg-burgundy text-cream transition-transform duration-300 hover:translate-x-0.5 active:scale-90">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Autoplay progress */}
      {!reduce && (
        <div aria-hidden className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-burgundy/10">
          <motion.div key={`${i}-${paused}`} className="h-full origin-left bg-burgundy" initial={{ scaleX: 0 }} animate={{ scaleX: paused ? 0 : 1 }} transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }} />
        </div>
      )}
    </section>
  );
}
