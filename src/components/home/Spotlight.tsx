"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProductById, imagesFor } from "@/data/products";
import { ChevronLeft, ChevronRight, ArrowRight } from "@/components/ui/Icons";
import { formatINR } from "@/lib/site";
import { cn } from "@/lib/cn";

const TONES = ["bg-espresso", "bg-burgundy", "bg-ochre"];

/** Little wave mark in a card's corner. */
const Wave = () => (
  <svg viewBox="0 0 24 10" className="h-3 w-6" fill="none" aria-hidden>
    <path d="M1 6c2-3 4-3 6 0s4 3 6 0 4-3 6 0 3 2 4 1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/**
 * The shelf: tall rounded cards that scroll sideways (swipe, trackpad or arrows), each with its name set in the
 * top corner and a Shop Now pill. A thin bar under the row shows how far along you are.
 */
export function Spotlight({ ids }: { ids: string[] }) {
  const items = ids.map((id) => getProductById(id)!).filter(Boolean);
  const track = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 1);
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const page = (d: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: d * ((card?.clientWidth ?? 300) + 16), behavior: "smooth" });
  };
  const arrow = "grid h-11 w-11 place-items-center rounded-full transition-[background-color,color,opacity] duration-300 disabled:opacity-30";

  return (
    <div>
      <ul ref={track} className="no-scrollbar -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory scroll-px-[var(--spacing-gutter)] gap-4 overflow-x-auto px-[var(--spacing-gutter)] pb-2 pt-2">
        {items.map((p, k) => (
          <li key={p.id} className="w-[76vw] max-w-[360px] shrink-0 snap-start sm:w-[44vw] lg:w-[calc((100%-3rem)/3.4)]" style={{ animation: `fade-up 800ms var(--ease-lux) ${k * 70}ms both` }}>
            <Link href={`/products/${p.slug}`} className={cn("lift group relative block aspect-[4/5.3] overflow-hidden rounded-[22px]", TONES[k % 3])}>
              <Image src={imagesFor(p)[0]} alt={p.name} fill sizes="(max-width:640px) 76vw, 360px" className="object-cover" />
              <div aria-hidden className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/55 to-transparent" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5 text-cream md:p-6">
                <div className="min-w-0">
                  <h3 className="font-serif text-[22px] font-extrabold leading-[1.05] md:text-[25px]">{p.name.replace(/^The /, "")}</h3>
                  <p className="mt-1.5 text-[13px] font-bold text-cream/85">{formatINR(p.price)}</p>
                  <span className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-full bg-burgundy px-4 text-[10.5px] font-bold uppercase tracking-[0.08em] transition-colors duration-300 group-hover:bg-ochre group-hover:text-ink">
                    Shop now
                  </span>
                </div>
                <span className="mt-2 shrink-0 text-cream/90">
                  <Wave />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-center gap-4">
        <button type="button" onClick={() => page(-1)} disabled={edges.start} aria-label="Previous pieces" className={cn(arrow, "text-ink hover:bg-ink hover:text-cream")}>
          <ChevronLeft size={16} />
        </button>
        <button type="button" onClick={() => page(1)} disabled={edges.end} aria-label="More pieces" className={cn(arrow, "text-ink hover:bg-ink hover:text-cream")}>
          <ChevronRight size={16} />
        </button>
        <div aria-hidden className="relative h-[3px] w-28 overflow-hidden rounded-full bg-ink/12 sm:w-40">
          <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-burgundy transition-transform duration-200" style={{ transform: `translateX(${progress * 200}%)` }} />
        </div>
        <Link href="/best-sellers" className="btn btn-dark btn-sm ml-auto">
          View all <ArrowRight size={13} className="btn-arrow" />
        </Link>
      </div>
    </div>
  );
}
