"use client";

import { Fragment, useRef, useState, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, wrap } from "framer-motion";
import { Doodle } from "@/components/doodles/Doodle";
import { cn } from "@/lib/cn";

/**
 * Scroll-linked drift. The element travels `speed`×200px across its time on screen (positive = slower than the page,
 * i.e. it lags behind), optionally turning by `rotate` degrees. Springs smooth out wheel steps. Off under reduced motion.
 */
export function Parallax({ children, speed = 0.15, rotate = 0, scale = 0, className }: { children: ReactNode; speed?: number; rotate?: number; scale?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const y = useTransform(p, [0, 1], [speed * 200, -speed * 200]);
  const r = useTransform(p, [0, 1], [rotate, -rotate]);
  const s = useTransform(p, [0, 0.5, 1], [1 - scale, 1, 1 - scale]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y, rotate: r, scale: s }}>
      {children}
    </motion.div>
  );
}

/**
 * Marquee whose speed follows the reader: scroll faster and it races, scroll up and it runs backwards,
 * with a slight lean in the direction of travel. Pauses while hovered.
 */
export function VelocityMarquee({ children, speed = 2.2, className }: { children: ReactNode; speed?: number; className?: string }) {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const v = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(v, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const skew = useTransform(v, [-2500, 0, 2500], [6, 0, -6]);
  const x = useTransform(base, (b) => `${wrap(-50, 0, b)}%`);
  const dir = useRef(1);
  const [paused, setPaused] = useState(false);

  useAnimationFrame((_, delta) => {
    if (reduce || paused) return;
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    base.set(base.get() - dir.current * speed * (delta / 1000) * (1 + Math.abs(f)));
  });

  return (
    <div className={cn("overflow-hidden", className)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <motion.div aria-hidden className="flex w-max" style={{ x, skewX: reduce ? 0 : skew }}>
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/** A thread that runs across the top of the page as you read, pulled along by a needle. */
export function ScrollThread() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  const left = useTransform(p, (v) => `${v * 100}%`);
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <motion.div className="absolute inset-y-0 left-0 bg-ochre" style={{ width: left }} />
      <motion.div className="absolute -top-[9px] h-6 w-6 -translate-x-1/2 text-ochre" style={{ left }}>
        <Doodle name="needle" className="h-full w-full rotate-[40deg]" strokeWidth={2.4} />
      </motion.div>
    </div>
  );
}

type Part = string | { em: string; className?: string };

/**
 * Heading whose words spring up from below a mask, each with a little tilt, as the heading enters view.
 * Italic accents are passed as `{ em }` parts. Screen readers get the sentence once, as plain text.
 */
export function SpringHeading({ parts, as: Tag = "h2", id, className, delay = 0, immediate = false }: { parts: Part[]; as?: "h1" | "h2" | "h3" | "p"; id?: string; className?: string; delay?: number; immediate?: boolean }) {
  const words: { w: string; em?: string }[] = [];
  for (const part of parts) {
    if (typeof part === "string") part.split(" ").filter(Boolean).forEach((w) => words.push({ w }));
    else part.em.split(" ").filter(Boolean).forEach((w) => words.push({ w, em: part.className ?? "" }));
  }
  const label = words.map((x) => x.w).join(" ");
  const M = motion[Tag];
  return (
    <M
      id={id}
      className={className}
      aria-label={label}
      initial="hidden"
      {...(immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "0px 0px -12% 0px" } })}
      transition={{ staggerChildren: 0.06, delayChildren: delay / 1000 }}
    >
      {words.map((x, i) => (
        <Fragment key={i}>
          <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top">
            <motion.span
              className={cn("inline-block origin-bottom-left", x.em !== undefined && "italic", x.em)}
              variants={{ hidden: { y: "110%", rotate: 8 }, show: { y: "0%", rotate: 0, transition: { type: "spring", stiffness: 140, damping: 16, mass: 0.8 } } }}
            >
              {x.w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </M>
  );
}

/**
 * Letters that drop into place one by one with a bounce, then hop when the pointer passes over them.
 * Used for the "Made to be worn" sign.
 */
export function BounceLetters({ text, className }: { text: string; className?: string }) {
  return (
    <motion.p aria-label={text} className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={{ staggerChildren: 0.045 }}>
      {text.split(" ").map((word, wi, all) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {[...word].map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block cursor-default"
                variants={{
                  hidden: { y: "-120%", rotate: (i % 2 ? 1 : -1) * 18, opacity: 0 },
                  show: { y: "0%", rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 12 } },
                }}
                whileHover={{ y: "-14%", rotate: (i % 2 ? 1 : -1) * 6, transition: { type: "spring", stiffness: 500, damping: 10 } }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
          {wi < all.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.p>
  );
}

/** Dealt onto the table like a print: flies up from below, spinning slightly, and lands with a bounce. */
export function DealIn({ children, index = 0, className, as = "div" }: { children: ReactNode; index?: number; className?: string; as?: "div" | "li" }) {
  const M = motion[as];
  const spin = [-14, 10, -8, 12][index % 4];
  return (
    <M
      className={className}
      initial={{ y: 180, x: (1 - index) * 40, rotate: spin, opacity: 0 }}
      whileInView={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ type: "spring", stiffness: 120, damping: 15, mass: 0.9, delay: index * 0.12 }}
    >
      {children}
    </M>
  );
}
