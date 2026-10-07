"use client";

import { Eyebrow } from "@/components/motion/Eyebrow";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WARDROBE } from "@/data/story";
import { products } from "@/data/products";
import { WordReveal } from "@/components/motion/WordReveal";
import { finePointer, prefersReducedMotion } from "@/components/motion/useInView";
import { ArrowRight, Plus } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

/**
 * 03 — "Services": what we make, in plain language.
 * Desktop: hovering a row previews its photograph, which follows the pointer (lerp 0.15).
 * Every row expands (click / Enter) to answer: what is it, how does it help, what do I get.
 * Touch: rows are an accordion with the image inline.
 */
export function WardrobeIndex() {
  const [open, setOpen] = useState<string | null>(WARDROBE[0].id);
  const [hover, setHover] = useState<string | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = area.current;
    if (!el || !finePointer() || prefersReducedMotion()) return;
    const pos = { x: 0, y: 0, tx: 0, ty: 0, init: false };
    let raf = 0;
    const tick = () => {
      pos.x += (pos.tx - pos.x) * 0.15;
      pos.y += (pos.ty - pos.y) * 0.15;
      // Sits beside the cursor (never under it) so the row text stays readable.
      if (float.current) float.current.style.transform = `translate3d(${pos.x + 36}px, ${pos.y}px, 0) translateY(-50%) rotate(${(pos.tx - pos.x) * 0.02}deg)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pos.tx = e.clientX - r.left;
      pos.ty = e.clientY - r.top;
      if (!pos.init) {
        pos.x = pos.tx;
        pos.y = pos.ty;
        pos.init = true;
      }
    };
    raf = requestAnimationFrame(tick);
    el.addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
    };
  }, []);

  const count = (cats: string[]) => products.filter((p) => cats.includes(p.category)).length;
  // Preview only for closed rows — an open row already shows its own image and copy.
  const preview = WARDROBE.find((w) => w.id === hover && w.id !== open);

  return (
    <section id="wardrobe" data-section="What we make" aria-labelledby="wardrobe-title" className="section-y">
      <div className="container-site">
        <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow>What We Make</Eyebrow>
            <WordReveal id="wardrobe-title" text="Five things, made properly." className="display-lg mt-5" />
          </div>
          <p className="max-w-md text-[15.5px] leading-relaxed text-muted md:col-span-5">We focus on topwear and tailoring only — so every piece gets the attention a specialist would give it. Open a line to see what it is, how it helps and what you get.</p>
        </div>

        <div ref={area} className="relative" onPointerLeave={() => setHover(null)}>
          {/* Pointer-following preview (desktop) */}
          <div ref={float} aria-hidden className={cn("pointer-events-none absolute left-0 top-0 z-10 hidden w-[220px] transition-opacity duration-300 lg:block", preview ? "opacity-100" : "opacity-0")}>
            <div className="relative aspect-[3/4] overflow-hidden bg-bone shadow-[var(--shadow-lift)]">
              {WARDROBE.map((w) => (
                <Image key={w.id} src={w.image} alt="" fill sizes="260px" className={cn("img-grade object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-lux)]", preview?.id === w.id ? "scale-100 opacity-100" : "scale-110 opacity-0")} />
              ))}
            </div>
          </div>

          <ol className="border-t border-ink">
            {WARDROBE.map((w, i) => {
              const isOpen = open === w.id;
              return (
                <li key={w.id} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      onPointerEnter={() => setHover(w.id)}
                      onPointerLeave={() => setHover(null)}
                      aria-expanded={isOpen}
                      aria-controls={`wd-${w.id}`}
                      onClick={() => setOpen(isOpen ? null : w.id)}
                      className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 text-left md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.3fr)_auto] md:py-8"
                    >
                      <span className="text-[12px] tabular-nums text-faint">0{i + 1}</span>
                      <span className="font-serif text-[clamp(1.8rem,4.4vw,3.6rem)] leading-none transition-transform duration-500 ease-[var(--ease-lux)] group-hover:translate-x-2">{w.name}</span>
                      <span className="hidden text-[14.5px] leading-relaxed text-muted md:block">{w.what}</span>
                      <span className="flex items-center gap-4">
                        <span className="hidden text-[12px] text-faint sm:inline">{count(w.categories)} pieces</span>
                        <span className={cn("grid h-10 w-10 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-lux)]", isOpen ? "rotate-45 border-ink bg-ink text-ivory" : "border-line group-hover:border-ink")}>
                          <Plus size={14} />
                        </span>
                      </span>
                    </button>
                  </h3>
                  <div id={`wd-${w.id}`} role="region" aria-label={w.name} className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-lux)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden" inert={!isOpen}>
                      <div className="grid gap-8 pb-10 md:grid-cols-[4rem_1fr_1fr_1fr_auto] md:gap-10">
                        <span className="hidden md:block" />
                        <div className="relative aspect-[4/3] overflow-hidden bg-bone md:hidden">
                          <Image src={w.image} alt={w.name} fill sizes="100vw" className="img-grade object-cover" />
                        </div>
                        <p className="text-[14.5px] text-muted md:hidden">{w.what}</p>
                        <div>
                          <p className="eyebrow text-[10px] text-muted">How it helps you</p>
                          <p className="mt-3 text-[15px] leading-relaxed text-charcoal">{w.helps}</p>
                        </div>
                        <div>
                          <p className="eyebrow text-[10px] text-muted">What you get</p>
                          <p className="mt-3 font-serif text-[22px] leading-snug">{w.outcome}</p>
                        </div>
                        <div>
                          <p className="eyebrow text-[10px] text-muted">Made from</p>
                          <p className="mt-3 text-[14px] leading-relaxed text-charcoal">{w.materials}</p>
                        </div>
                        <div className="md:self-end">
                          <Link href={w.href} className="btn btn-outline btn-sm">
                            <span>Shop {w.name}</span> <ArrowRight className="btn-arrow" size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
