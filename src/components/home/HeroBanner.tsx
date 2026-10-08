"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { SpringHeading } from "@/components/motion/Scroll";
import { Doodle } from "@/components/doodles/Doodle";
import { ArrowRight } from "@/components/ui/Icons";
import { IMG } from "@/data/images";

/**
 * Full-bleed campaign photograph with one line of type set into its corner, as on a magazine cover.
 * On scroll the photo sinks and zooms while the type lifts away faster — a cheap, convincing depth.
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

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative -mt-[var(--hdr)] h-[92svh] min-h-[560px] overflow-hidden bg-night text-cream md:h-[100svh] md:max-h-[1040px] md:min-h-[640px]">
      <motion.div className="absolute inset-0 will-change-transform" style={reduce ? undefined : { y: imgY, scale: imgScale }}>
        <Image src={IMG.manHat} alt="Man in a black tee and hat against a terracotta wall" fill priority sizes="100vw" className="ken-burns object-cover object-[58%_30%]" />
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
          <p className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-cream/85">Autumn / Winter ’26 · Designed in Mumbai</p>
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
