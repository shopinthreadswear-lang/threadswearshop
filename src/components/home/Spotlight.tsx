"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { getProductById, imagesFor } from "@/data/products";
import { Price } from "@/components/ui/Price";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

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
                "absolute bottom-0 left-1/2 w-[46%] origin-bottom overflow-hidden rounded-[22px] bg-bone transition-[transform,opacity,filter] duration-700 ease-[var(--ease-lux)] sm:w-[30%]",
                abs > 1 && "pointer-events-none",
                off === 0 ? "z-10 shadow-[0_30px_50px_-30px_rgb(62_33_23/0.55)]" : "z-0",
              )}
              style={{
                transform: `translateX(calc(-50% + ${off * 112}%)) scale(${off === 0 ? 1 : 0.62}) rotate(${off === 0 ? 0 : off * 3}deg)`,
                opacity: abs > 1 ? 0 : 1,
                filter: off === 0 ? "none" : "saturate(0.8)",
              }}
            >
              <div className="relative aspect-[4/5]">
                <Image src={imagesFor(p)[0]} alt={p.name} fill sizes="(max-width:640px) 46vw, 300px" className="object-cover" draggable={false} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mx-auto mt-8 max-w-sm text-center" aria-live="polite">
        <h3 className="font-serif text-[26px] leading-tight text-burgundy">{cur.name}</h3>
        <p className="mt-2 font-mono text-[12px] leading-relaxed text-muted">{cur.shortDescription}</p>
        <Price price={cur.price} compareAt={cur.compareAtPrice} className="mt-2 justify-center font-mono text-[13px]" />
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
