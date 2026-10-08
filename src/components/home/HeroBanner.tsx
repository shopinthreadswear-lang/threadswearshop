"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { SpringHeading } from "@/components/motion/Scroll";
import { Doodle } from "@/components/doodles/Doodle";
import { ArrowRight } from "@/components/ui/Icons";
import { IMG } from "@/data/images";

const LOOKS = [
  { img: IMG.manHat, alt: "Man in a black tee and hat against a terracotta wall", focus: "58% 30%", name: "The Black Heavyweight Tee", href: "/men/t-shirts" },
  { img: IMG.manBrownJacket, alt: "Man in a tobacco overshirt and white tee on a rooftop", focus: "55% 30%", name: "The Tobacco Overshirt", href: "/men/jackets" },
  { img: IMG.heroNavy, alt: "Man buttoning a navy suit jacket", focus: "50% 35%", name: "Navy Tailoring", href: "/men/designer-wear" },
];

/**
 * Full-bleed campaign photograph with one line of type set into its corner, as on a magazine cover.
 * On scroll the photo sinks and zooms while the type lifts away faster — a cheap, convincing depth.
 * Tap anywhere on the photo for the next look: it opens as a circle from where you tapped.
 * With a mouse, the photo drifts a few pixels against the pointer.
 */
export function HeroBanner() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const imgY = useTransform(p, [0, 1], ["0%", "28%"]);
  const imgScale = useTransform(p, [0, 1], [1, 1.18]);
  const textY = useTransform(p, [0, 1], ["0%", "-60%"]);
  const fade = useTransform(p, [0, 0.6], [1, 0]);
  const shade = useTransform(p, [0, 1], [0, 0.55]);

  const [look, setLook] = useState({ i: 0, x: 50, y: 50 });
  const next = (x = 50, y = 50) => setLook((l) => ({ i: (l.i + 1) % LOOKS.length, x, y }));
  const cur = LOOKS[look.i];
  // Fetch the other looks once the page has settled, so a tap reveals a photo, not an empty frame.
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWarm(true), 1800);
    return () => clearTimeout(t);
  }, []);
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * -24);
        my.set(((e.clientY - r.top) / r.height - 0.5) * -16);
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        const r = e.currentTarget.getBoundingClientRect();
        next(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
      }}
      data-cursor="Next look"
      className="relative -mt-[var(--hdr)] h-[92svh] min-h-[560px] overflow-hidden bg-night text-cream md:h-[100svh] md:max-h-[1040px] md:min-h-[640px]">
      <motion.div className="absolute inset-0 will-change-transform" style={reduce ? undefined : { y: imgY, scale: imgScale }}>
        <motion.div className="absolute -inset-4" style={{ x: mx, y: my }}>
          {warm && (
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0">
              {LOOKS.slice(1).map((l) => (
                <Image key={l.img} src={l.img} alt="" fill loading="eager" sizes="100vw" className="object-cover" />
              ))}
            </div>
          )}
          <AnimatePresence initial={false}>
            <motion.div
              key={look.i}
              className="absolute inset-0"
              initial={{ clipPath: `circle(0% at ${look.x}% ${look.y}%)` }}
              animate={{ clipPath: `circle(150% at ${look.x}% ${look.y}%)` }}
              exit={{ opacity: 1, transition: { duration: 1.1 } }}
              transition={{ duration: reduce ? 0 : 1.1, ease: [0.65, 0, 0.35, 1] }}
            >
              <Image src={cur.img} alt={cur.alt} fill priority={look.i === 0} sizes="100vw" className={look.i === 0 ? "ken-burns object-cover" : "object-cover"} style={{ objectPosition: cur.focus }} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1d0f0a]/75 via-[#1d0f0a]/10 to-[#1d0f0a]/35" />
      <motion.div aria-hidden className="absolute inset-0 bg-[#1d0f0a]" style={{ opacity: reduce ? 0 : shade }} />

      <motion.div className="container-site relative flex h-full flex-col justify-end pb-12 md:pb-20" style={reduce ? undefined : { y: textY, opacity: fade }}>
        <SpringHeading
          as="h1"
          id="hero-title"
          immediate
          delay={250}
          parts={["The shirt you’ll", { em: "reach for first." }]}
          className="max-w-[12ch] font-serif text-[clamp(2.9rem,7.4vw,7.4rem)] font-medium leading-[0.92] tracking-[-0.03em] [font-variation-settings:'SOFT'_100,'WONK'_1]"
        />
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animation: "fade-up 900ms var(--ease-lux) 900ms both" }}>
          <Link href="/new-arrivals" className="btn btn-light">
            Shop new arrivals <ArrowRight size={14} className="btn-arrow" />
          </Link>
          <button type="button" onClick={() => next()} className="group inline-flex min-h-11 items-center gap-3 font-mono text-[11.5px] uppercase tracking-[0.12em] text-cream/90" aria-label={`Show the next look (now: ${cur.name})`}>
            <span className="flex gap-1.5" aria-hidden>
              {LOOKS.map((_, k) => (
                <span key={k} className={`h-1.5 rounded-full bg-cream transition-all duration-500 ${k === look.i ? "w-6" : "w-1.5 opacity-40"}`} />
              ))}
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={look.i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.25 }}>
                Look {String(look.i + 1).padStart(2, "0")} · {cur.name}
              </motion.span>
            </AnimatePresence>
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>

      {/* Stamp that spins in the corner and invites a scroll */}
      <a href="#shelf-title" aria-label="Scroll to the collection" className="group absolute bottom-8 right-[var(--spacing-gutter)] hidden h-28 w-28 md:block lg:h-32 lg:w-32" style={{ animation: "fade-in 900ms var(--ease-lux) 1200ms both" }}>
        <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 h-full w-full text-cream group-hover:[animation-duration:6s]" aria-hidden>
          <defs>
            <path id="hero-rim" d="M100 100 m-80 0 a80 80 0 1 1 160 0 a80 80 0 1 1 -160 0" />
          </defs>
          <text className="fill-current font-mono text-[15px] uppercase" textLength={500} lengthAdjust="spacing">
            <textPath href="#hero-rim" textLength={500} lengthAdjust="spacing">
              Scroll down ✦ Made in Mumbai ✦ Since 2021 ✦
            </textPath>
          </text>
        </svg>
        <span className="absolute inset-[30%] grid place-items-center rounded-full bg-ochre text-burgundy transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-110">
          <ArrowRight size={18} className="rotate-90 transition-transform duration-500 group-hover:translate-y-1" />
        </span>
        <Doodle name="sparkle" className="absolute -left-3 -top-2 h-6 w-6 text-ochre" strokeWidth={2.4} />
      </a>
    </section>
  );
}
