"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "@/components/ui/Icons";
import { getProduct } from "@/data/products";
import { IMG } from "@/data/images";
import { formatINR } from "@/lib/site";

const LOOKS = [
  { img: IMG.manHat, alt: "Man in a black heavyweight tee and hat", focus: "58% 22%", words: ["Heavy", "cotton"], sub: "The shirt you’ll reach for first — heavyweight cotton, cut in Mumbai.", slug: "mercer-heavyweight-tee", href: "/men/t-shirts" },
  { img: IMG.manBrownJacket, alt: "Man in a tobacco overshirt and white tee", focus: "55% 22%", words: ["Layer", "season"], sub: "Layers with a bit of nerve — overshirts, suede and denim.", slug: "camden-overshirt", href: "/men/jackets" },
  { img: IMG.heroNavy, alt: "Man buttoning a navy suit jacket", focus: "50% 25%", words: ["Sharp", "tailoring"], sub: "Tailoring that means it — half-canvassed, alterations included.", slug: "savoy-two-piece-suit", href: "/men/designer-wear" },
];
const AUTOPLAY_MS = 6500;
const EASE = [0.22, 1, 0.36, 1] as const;
const BADGE = "THREADS WARE • CUT IN MUMBAI • SINCE 2021 •";

/** Spinning circular stamp, the brand set around a ring. */
function Badge() {
  return (
    <div className="relative grid h-[104px] w-[104px] place-items-center rounded-full bg-cream text-burgundy shadow-[0_18px_36px_-16px_rgb(46_10_16/0.7)] lg:h-[132px] lg:w-[132px]">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full animate-[spin_16s_linear_infinite] motion-reduce:animate-none" aria-hidden>
        <defs>
          <path id="badge-ring" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <text className="fill-current text-[10px] font-extrabold uppercase">
          <textPath href="#badge-ring" textLength="282" lengthAdjust="spacing">{BADGE}</textPath>
        </text>
      </svg>
      <span aria-hidden className="font-serif text-[26px] font-black italic leading-none lg:text-[32px]">TW</span>
    </div>
  );
}

/**
 * Poster hero: two giant words set behind an arched photo, a spinning stamp on the frame, the story on the left
 * and a statement + button on the right. Slides swap the words, wipe the photo up, and the type drifts on scroll.
 */
export function HeroBanner() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [[i, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const [warm, setWarm] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const go = useCallback((d: number) => setState(([x]) => [(x + d + LOOKS.length) % LOOKS.length, d]), []);
  const look = LOOKS[i];
  const product = getProduct(look.slug);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const typeY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -50]);

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
      className="relative -mt-[var(--hdr)] touch-pan-y overflow-hidden bg-burgundy pt-[calc(var(--hdr)+0.75rem)] sm:pt-[calc(var(--hdr)+1.75rem)] text-cream lg:h-[min(100svh,960px)] lg:min-h-[680px] lg:pt-0"
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
            <Image key={l.img} src={l.img} alt="" width={480} height={640} loading="eager" sizes="(max-width:768px) 75vw, 440px" />
          ))}
        </div>
      )}
      {/* Soft light behind the frame */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,rgb(255_255_255/0.08),transparent_60%)]" />

      {/* Giant words, behind the photo */}
      <motion.h1 style={{ y: typeY }} className="relative z-0 select-none text-center font-serif font-black uppercase leading-[0.84] tracking-[-0.04em] text-cream/[0.16] lg:absolute lg:inset-x-0 lg:top-[calc(var(--hdr)+2.5rem)]">
        <span className="sr-only">{look.words.join(" ")}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={i} aria-hidden className="block text-[clamp(4.2rem,19vw,15.5rem)] lg:text-[clamp(3.6rem,15vw,15.5rem)]" initial="hide" animate="show" exit="out" variants={{ show: { transition: { staggerChildren: 0.08 } }, out: { transition: { staggerChildren: 0.04 } } }}>
            {look.words.map((w) => (
              <span key={w} className="block overflow-hidden pb-[0.02em]">
                <motion.span
                  className="block"
                  variants={{
                    hide: { y: reduce ? 0 : "100%", opacity: reduce ? 0 : 1 },
                    show: { y: "0%", opacity: 1, transition: { duration: 0.8, ease: EASE } },
                    out: { y: reduce ? 0 : "-100%", opacity: reduce ? 0 : 1, transition: { duration: 0.4, ease: [0.65, 0, 0.35, 1] } },
                  }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </motion.span>
        </AnimatePresence>
      </motion.h1>

      {/* Arched photo, in front of the words */}
      <motion.div
        style={{ y: photoY }}
        initial={reduce ? false : { y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 1.1, ease: EASE, delay: 0.15 } }}
        className="relative z-10 mx-auto -mt-[5vw] w-[62%] max-w-[300px] sm:max-w-[340px] md:max-w-[380px] lg:absolute lg:bottom-0 lg:left-1/2 lg:mt-0 lg:w-[min(32vw,450px)] lg:max-w-none lg:-translate-x-1/2"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] bg-[#5e1420] shadow-[0_40px_80px_-40px_rgb(20_4_8/0.8)] lg:aspect-[3/4.1] sm:aspect-[3/4]">
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={i}
              custom={dir}
              className="absolute inset-0"
              variants={{
                enter: { clipPath: reduce ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)", zIndex: 2 },
                center: { clipPath: "inset(0% 0 0 0)", zIndex: 2, transition: { duration: 0.95, ease: [0.76, 0, 0.24, 1] } },
                exit: { zIndex: 1, transition: { duration: 0.95 } },
              }}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.18 }} animate={{ scale: 1, transition: { duration: 1.6, ease: EASE } }}>
                <Image src={look.img} alt={look.alt} fill priority={i === 0} sizes="(max-width:768px) 75vw, 450px" className="object-cover" style={{ objectPosition: look.focus }} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <div aria-hidden className="absolute inset-x-0 bottom-0 z-[3] h-1/3 bg-gradient-to-t from-[rgb(46_10_16/0.35)] to-transparent" />
        </div>
        <motion.div
          className="absolute -left-8 bottom-[10%] z-20 scale-[0.8] sm:scale-100 lg:-left-12 lg:bottom-[22%] xl:-left-16"
          initial={reduce ? false : { scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0, transition: { type: "spring", stiffness: 180, damping: 14, delay: 0.7 } }}
        >
          <Badge />
        </motion.div>
      </motion.div>

      {/* Left: the story + controls */}
      <div className="container-site relative z-20 flex flex-col gap-5 pb-6 pt-6 sm:gap-8 sm:pb-10 sm:pt-8 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-0 lg:h-full lg:flex-row lg:items-end lg:justify-between lg:pb-14 lg:pt-0">
        <div className="order-2 flex items-center justify-between gap-4 lg:pointer-events-auto lg:order-1 lg:block lg:max-w-[14.5rem] xl:max-w-[19rem]">
          <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-cream/70">New season · {String(i + 1).padStart(2, "0")}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={i} initial={{ opacity: 0, y: 12, filter: reduce ? "none" : "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: EASE }}>
              <p className="mt-3 hidden text-[13.5px] leading-relaxed text-cream/80 sm:block">{look.sub}</p>
              {product && (
                <Link href={`/products/${product.slug}`} className="link-u mt-1.5 inline-block text-[12.5px] font-bold text-cream sm:mt-3">
                  {product.name.replace(/^The /, "")} — {formatINR(product.price)}
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 lg:mt-6">
            <button type="button" onClick={() => go(-1)} aria-label="Previous look" className="grid h-10 w-10 place-items-center rounded-full border sm:h-11 sm:w-11 border-cream/35 text-cream transition-[transform,background-color,color] duration-300 hover:-translate-x-0.5 hover:bg-cream hover:text-burgundy active:scale-90">
              <ChevronLeft size={15} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next look" className="grid h-10 w-10 place-items-center rounded-full bg-cream sm:h-11 sm:w-11 text-burgundy transition-transform duration-300 hover:translate-x-0.5 active:scale-90">
              <ChevronRight size={15} />
            </button>
            <span className="ml-2 hidden text-[11px] sm:inline font-bold tabular-nums tracking-[0.1em] text-cream/75" aria-live="polite">
              {String(i + 1).padStart(2, "0")} / {String(LOOKS.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Right: the statement */}
        <motion.div
          className="order-1 flex items-end justify-between gap-4 lg:pointer-events-auto lg:block lg:order-2 lg:mb-2 lg:text-left"
          initial={reduce ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE, delay: 0.45 } }}
        >
          <p className="font-serif text-[clamp(1.3rem,4.6vw,2.3rem)] font-black lg:text-[clamp(1.6rem,2.6vw,2.5rem)] uppercase leading-[0.95] tracking-[-0.02em]">
            Make a stylish
            <br />
            <span className="text-cream/60">statement</span>
          </p>
          <Link href={look.href} className="btn btn-cream btn-sm shrink-0 sm:h-[2.9rem] lg:mt-5">
            Shop now <ArrowRight size={13} className="btn-arrow" />
          </Link>
        </motion.div>
      </div>

      {/* Autoplay progress */}
      {!reduce && (
        <div aria-hidden className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-cream/15">
          <motion.div key={`${i}-${paused}`} className="h-full origin-left bg-cream" initial={{ scaleX: 0 }} animate={{ scaleX: paused ? 0 : 1 }} transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }} />
        </div>
      )}
    </section>
  );
}
