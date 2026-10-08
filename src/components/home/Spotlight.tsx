"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { getProductById, imagesFor } from "@/data/products";
import { Price } from "@/components/ui/Price";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

/** Card that leans toward the pointer in 3D, with a soft highlight sliding across it. */
function Tilt({ children, active }: { children: ReactNode; active: boolean }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 200, damping: 20 });
  const sy = useSpring(my, { stiffness: 200, damping: 20 });
  const rotateY = useTransform(sx, [0, 1], [-12, 12]);
  const rotateX = useTransform(sy, [0, 1], [10, -10]);
  const glare = useTransform([sx, sy], ([x, y]: number[]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgb(255 255 255 / 0.28), transparent 55%)`);
  const on = active && !reduce;
  return (
    <motion.div
      className="relative aspect-[4/5] overflow-hidden rounded-[22px]"
      style={on ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      onPointerMove={(e) => {
        if (!on || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      {children}
      {on && <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{ background: glare }} />}
    </motion.div>
  );
}

/**
 * "Not-so-ordinary" shelf: one piece centre stage, its neighbours waiting in the wings.
 * Arrow buttons, arrow keys and a swipe all move the shelf.
 */
export function Spotlight({ ids }: { ids: string[] }) {
  const items = ids.map((id) => getProductById(id)!).filter(Boolean);
  const [i, setI] = useState(0);
  const n = items.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const startX = useRef<number | null>(null);
  const cur = items[i];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured pieces"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      className="outline-none"
    >
      <div
        className="relative mx-auto aspect-[7/4] max-w-[980px] touch-pan-y select-none sm:aspect-[8/3]"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          startX.current = null;
        }}
      >
        {items.map((p, k) => {
          let off = k - i;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          return (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              tabIndex={off === 0 ? 0 : -1}
              aria-hidden={off !== 0}
              draggable={false}
              onClick={(e) => {
                if (off !== 0) {
                  e.preventDefault();
                  go(off);
                }
              }}
              data-cursor={off === 0 ? "View" : undefined}
              className={cn(
                "absolute bottom-0 left-1/2 w-[46%] origin-bottom rounded-[22px] bg-bone transition-[transform,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.34,1.4,0.5,1)] sm:w-[30%]",
                abs > 1 && "pointer-events-none",
                off === 0 ? "z-10 shadow-[0_30px_50px_-30px_rgb(62_33_23/0.55)]" : "z-0",
              )}
              style={{
                transform: `translateX(calc(-50% + ${off * 112}%)) scale(${off === 0 ? 1 : 0.62}) rotate(${off === 0 ? 0 : off * 3}deg)`,
                opacity: abs > 1 ? 0 : 1,
                filter: off === 0 ? "none" : "saturate(0.8)",
              }}
            >
              <Tilt active={off === 0}>
                <Image src={imagesFor(p)[0]} alt={p.name} fill sizes="(max-width:640px) 46vw, 300px" className="object-cover" draggable={false} />
              </Tilt>
            </Link>
          );
        })}
      </div>

      <div className="mx-auto mt-8 min-h-[118px] max-w-sm overflow-hidden text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={cur.id} initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <h3 className="font-serif text-[26px] leading-tight text-burgundy">{cur.name}</h3>
            <p className="mt-2 font-mono text-[12px] leading-relaxed text-muted">{cur.shortDescription}</p>
            <Price price={cur.price} compareAt={cur.compareAtPrice} className="mt-2 justify-center font-mono text-[13px]" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(-1)} aria-label="Previous piece" className="grid h-11 w-11 place-items-center rounded-full bg-bottle text-cream transition-transform duration-300 hover:-translate-x-0.5 active:scale-95">
          <ArrowLeft size={15} />
        </button>
        <Link href={`/products/${cur.slug}`} className="btn btn-green btn-sm">
          View product
        </Link>
        <button type="button" onClick={() => go(1)} aria-label="Next piece" className="grid h-11 w-11 place-items-center rounded-full bg-bottle text-cream transition-transform duration-300 hover:translate-x-0.5 active:scale-95">
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
