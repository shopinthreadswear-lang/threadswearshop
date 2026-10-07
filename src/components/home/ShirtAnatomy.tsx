"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ANATOMY } from "@/data/story";
import { getProduct } from "@/data/products";
import { WordReveal } from "@/components/motion/WordReveal";
import { Eyebrow } from "@/components/motion/Eyebrow";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { finePointer } from "@/components/motion/useInView";
import { formatINR } from "@/lib/site";
import { cn } from "@/lib/cn";

const ZOOM = 1.08;
const TOUR_MS = 3800;
const D = ANATOMY.details;

/**
 * The Anatomy of a Shirt — an annotated photograph, like a page from a tailor's notebook.
 * Hover / tap a number (or the index) to study a detail: the photo eases toward it (900ms), a soft
 * spotlight follows, and a hairline draws out to a short note. "Take the tour" steps through all six.
 */
export function ShirtAnatomy() {
  const [active, setActive] = useState(0);
  const [touring, setTouring] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const product = getProduct(ANATOMY.product)!;
  const d = D[active];

  const select = useCallback((i: number, stopTour = true) => {
    setActive((i + D.length) % D.length);
    if (stopTour) setTouring(false);
  }, []);

  // Desktop hover with a short intent delay, so sweeping the cursor across doesn't flicker.
  const hoverSelect = (i: number) => {
    if (!finePointer()) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => select(i), 110);
  };
  const cancelHover = () => hoverTimer.current && clearTimeout(hoverTimer.current);

  useEffect(() => {
    if (!touring) return;
    const t = setTimeout(() => select(active + 1, false), TOUR_MS);
    return () => clearTimeout(t);
  }, [touring, active, select]);

  // Where each dot sits after zooming about the active point: p' = o + s·(p − o)
  const place = (x: number, y: number) => ({ left: `${(d.x + ZOOM * (x - d.x)) * 100}%`, top: `${(d.y + ZOOM * (y - d.y)) * 100}%` });

  // Annotation card sits on the open side of the dot; the hairline runs to its edge.
  const toLeft = d.x > 0.5;
  const cardY = Math.min(0.84, Math.max(0.16, d.y));
  const edgeX = toLeft ? d.x - 0.07 : d.x + 0.07;

  return (
    <section id="anatomy" data-section="Craft" aria-labelledby="anatomy-title" className="grain relative border-t border-line bg-paper section-y">
      <div className="container-site">
        <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow>The Anatomy of a Shirt</Eyebrow>
            <WordReveal id="anatomy-title" text="Six details you feel before you notice." className="display-lg mt-5" />
          </div>
          <div className="md:col-span-5">
            <p className="max-w-md text-[15.5px] leading-relaxed text-charcoal">Most shirts look alike on a hanger. The difference is in the details — hover or tap a number on the photograph to study each one.</p>
            <p className="mt-3 font-serif text-[18px] italic text-muted">— notes from the cutting table</p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ── Annotated photograph ── */}
          <figure className="lg:col-span-7" onPointerLeave={cancelHover}>
            <div className="relative aspect-[5/4] overflow-hidden bg-bone">
              <div className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-lux)]" style={{ transform: `scale(${ZOOM})`, transformOrigin: `${d.x * 100}% ${d.y * 100}%` }}>
                <Image src={ANATOMY.image} alt={`${product.name}, worn — annotated with six construction details`} fill sizes="(max-width: 1024px) 100vw, 58vw" className="img-grade object-cover" />
              </div>
              {/* Spotlight follows the active detail (registered custom properties transition smoothly) */}
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ transition: "--sx 900ms var(--ease-lux), --sy 900ms var(--ease-lux)", "--sx": `${d.x * 100}%`, "--sy": `${d.y * 100}%`, background: "radial-gradient(circle at var(--sx) var(--sy), transparent 0%, transparent 13%, rgb(42 11 19 / 0.34) 46%)" } as React.CSSProperties} />

              {/* Hairline to the note (desktop) */}
              <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line key={active} x1={d.x * 100} y1={d.y * 100} x2={edgeX * 100} y2={cardY * 100} stroke="#f5ebe1" strokeWidth="1" vectorEffect="non-scaling-stroke" pathLength={100} strokeDasharray="100" className="anatomy-line" />
              </svg>
              <div
                key={`note-${active}`}
                aria-hidden
                className="pointer-events-none absolute hidden w-[min(250px,34%)] -translate-y-1/2 bg-ivory/95 px-4 py-3.5 shadow-[var(--shadow-float)] backdrop-blur-sm md:block"
                style={{ top: `${cardY * 100}%`, ...(toLeft ? { right: `${(1 - edgeX) * 100}%` } : { left: `${edgeX * 100}%` }), animation: "fade-in 500ms var(--ease-lux) 250ms both" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">No. {d.n}</p>
                <p className="mt-1 font-serif text-[21px] italic leading-tight">{d.title}</p>
                <p className="mt-1 text-[12.5px] text-charcoal">{d.short}</p>
                <p className="mt-2 border-t border-line pt-2 text-[10.5px] uppercase tracking-[0.12em] text-muted">{d.spec}</p>
              </div>

              {/* Numbered points */}
              {D.map((p, i) => (
                <button
                  key={p.n}
                  type="button"
                  onClick={() => select(i)}
                  onPointerEnter={() => hoverSelect(i)}
                  aria-pressed={i === active}
                  aria-label={`${p.n} ${p.title}: ${p.short}`}
                  className="group absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center transition-[left,top] duration-[900ms] ease-[var(--ease-lux)]"
                  style={place(p.x, p.y)}
                >
                  {i === active && <span aria-hidden className="absolute h-9 w-9 animate-ping rounded-full bg-ivory/50 [animation-duration:2.2s] motion-reduce:animate-none" />}
                  <span className={cn("relative grid h-8 w-8 place-items-center rounded-full text-[10.5px] font-semibold tabular-nums shadow-[0_2px_10px_rgb(0_0_0/0.18)] transition-[transform,background-color,color] duration-300 ease-[var(--ease-lux)] group-hover:scale-110", i === active ? "scale-110 bg-ink text-ivory" : "bg-ivory/90 text-ink")}>{p.n}</span>
                </button>
              ))}
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <span className="text-[12.5px] text-muted">
                Shown: {product.name} · {formatINR(product.price)}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-[12px] tabular-nums text-muted">
                  {d.n} / 0{D.length}
                </span>
                <button type="button" onClick={() => select(active - 1)} aria-label="Previous detail" className="grid h-10 w-10 place-items-center rounded-full border border-line transition-colors hover:border-ink">
                  <ArrowLeft />
                </button>
                <button type="button" onClick={() => select(active + 1)} aria-label="Next detail" className="grid h-10 w-10 place-items-center rounded-full border border-line transition-colors hover:border-ink">
                  <ArrowRight />
                </button>
              </span>
            </figcaption>
          </figure>

          {/* ── Index ── */}
          <div className="lg:col-span-5">
            <button type="button" onClick={() => setTouring((t) => !t)} aria-pressed={touring} className="group mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]">
              <span className="relative grid h-9 w-9 place-items-center rounded-full border border-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-ivory">
                {touring ? (
                  <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
                    <path d="M1 1h2.5v10H1zM6.5 1H9v10H6.5z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="10" height="12" viewBox="0 0 12 14" aria-hidden>
                    <path d="M1 1l10 6-10 6V1z" fill="currentColor" />
                  </svg>
                )}
              </span>
              {touring ? "Pause the tour" : "Take the tour"}
            </button>

            <ol className="border-t border-ink" onPointerLeave={cancelHover}>
              {D.map((p, i) => {
                const on = i === active;
                return (
                  <li key={p.n} className="relative border-b border-line">
                    <span aria-hidden className={cn("absolute left-0 top-0 h-full w-px origin-top bg-ink transition-transform duration-500 ease-[var(--ease-lux)]", on ? "scale-y-100" : "scale-y-0")} />
                    <button type="button" onClick={() => select(i)} onPointerEnter={() => hoverSelect(i)} aria-expanded={on} className="grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-4 pl-4 text-left">
                      <span className={cn("text-[11px] tabular-nums transition-colors duration-300", on ? "text-ink" : "text-faint")}>{p.n}</span>
                      <span>
                        <span className={cn("block font-serif text-[23px] leading-tight transition-[color,transform] duration-500 ease-[var(--ease-lux)]", on ? "translate-x-1 text-ink" : "text-muted")}>{p.title}</span>
                        <span className="mt-0.5 block text-[12.5px] text-muted">{p.short}</span>
                      </span>
                      {touring && on ? (
                        <span aria-hidden className="relative h-px w-10 self-center bg-line">
                          <span key={active} className="absolute inset-y-0 left-0 bg-ink" style={{ animation: `tour-progress ${TOUR_MS}ms linear both` }} />
                        </span>
                      ) : (
                        <span aria-hidden />
                      )}
                    </button>
                    <div className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-lux)]", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                      <div className="overflow-hidden" inert={!on}>
                        <p className="pb-5 pl-[calc(2.5rem+1.75rem)] pr-2 text-[14px] leading-relaxed text-charcoal">{p.note}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/products/${product.slug}`} className="btn btn-primary">
                <span>Shop the Shirt</span> <ArrowRight className="btn-arrow" size={15} />
              </Link>
              <Link href="/men/shirts" className="btn btn-outline">
                All Shirts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
