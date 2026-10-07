"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { getProductById } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

export function ProductCarousel({ ids, label, className, itemClassName }: { ids: string[]; label: string; className?: string; itemClassName?: string }) {
  const products = ids.map(getProductById).filter(Boolean) as Product[];
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ start: true, end: false, progress: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setState({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4, progress: max > 0 ? el.scrollLeft / max : 1 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [products.length]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <div className={cn("relative", className)}>
      <ul ref={ref} aria-label={label} className="no-scrollbar -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[var(--spacing-gutter)] px-[var(--spacing-gutter)] md:gap-5">
        {products.map((p, i) => (
          <li key={p.id} className={cn("w-[68%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-[23.5%]", itemClassName)}>
            <ProductCard product={p} priority={i < 2} sizes="(max-width: 640px) 68vw, (max-width: 1024px) 31vw, 24vw" />
          </li>
        ))}
      </ul>
      <div className="mt-8 flex items-center gap-6">
        <div className="relative h-px flex-1 bg-line" aria-hidden>
          <div className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-300" style={{ width: `${Math.max(12, state.progress * 100)}%` }} />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-1)} disabled={state.start} aria-label="Previous products" className="grid h-11 w-11 place-items-center border border-line transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-line">
            <ArrowLeft />
          </button>
          <button type="button" onClick={() => scroll(1)} disabled={state.end} aria-label="Next products" className="grid h-11 w-11 place-items-center border border-line transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-line">
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
