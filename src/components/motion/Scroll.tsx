"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, wrap } from "framer-motion";
import { cn } from "@/lib/cn";

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

/** A thin ochre line across the top of the page that fills as you read. */
export function ScrollThread() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  const left = useTransform(p, (v) => `${v * 100}%`);
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <motion.div className="absolute inset-y-0 left-0 bg-ochre" style={{ width: left }} />
    </div>
  );
}

