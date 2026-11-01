"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { WavyBand } from "./WavyBand";
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
    <>
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
      className="relative h-[78svh] min-h-[500px] overflow-hidden bg-night text-cream md:h-[86svh] md:max-h-[900px] md:min-h-[600px]">
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
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgb(20_18_10/0.6),transparent_55%),linear-gradient(to_top,rgb(20_18_10/0.55),transparent_45%)]" />
      <motion.div aria-hidden className="absolute inset-0 bg-[#14120a]" style={{ opacity: reduce ? 0 : shade }} />

      <motion.div className="container-site relative flex h-full flex-col justify-between pb-24 pt-8 md:pb-32 md:pt-12" style={reduce ? undefined : { y: textY, opacity: fade }}>
        <div className="max-w-[19rem] md:max-w-[22rem]" style={{ animation: "fade-up 900ms var(--ease-lux) 250ms both" }}>
          <h1 id="hero-title" className="text-[16px] font-semibold leading-snug md:text-[18px]">
            We make shirts, tees &amp; tailoring that stand out, get noticed &amp; leave an impression that sticks.
          </h1>
          <Link href="/new-arrivals" className="btn btn-sky btn-sm mt-5">
            Shop new in <ArrowRight size={14} className="btn-arrow" />
          </Link>
        </div>
        <button type="button" onClick={() => next()} className="group inline-flex min-h-11 items-center gap-3 self-start rounded-full bg-[#14120a]/45 px-4 text-[12px] font-semibold tracking-[0.04em] text-cream backdrop-blur-sm" aria-label={`Show the next look (now: ${cur.name})`} style={{ animation: "fade-up 900ms var(--ease-lux) 700ms both" }}>
          <span className="flex gap-1.5" aria-hidden>
            {LOOKS.map((_, k) => (
              <span key={k} className={`h-1.5 rounded-full bg-acid transition-all duration-500 ${k === look.i ? "w-6" : "w-1.5 opacity-50"}`} />
            ))}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={look.i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.25 }}>
              Look {String(look.i + 1).padStart(2, "0")} · {cur.name}<span className="hidden sm:inline"> — tap for the next</span>
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.div>
    </section>
    {/* The ribbon rides over the seam between the photo and the next section */}
    <WavyBand className="relative z-10 -mb-10 -mt-14 sm:-mt-20 md:-mb-14 md:-mt-24" />
    </>
  );
}
