"use client";

import Image from "next/image";
import { useState } from "react";
import { featuredReviews } from "@/data/reviews";
import { getProduct, imagesFor } from "@/data/products";
import { ArrowLeft, ArrowRight, Star } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

const TONES = ["bg-ochre text-ink", "bg-burgundy text-cream"];

function Card({ r, tone }: { r: (typeof featuredReviews)[number]; tone: string }) {
  return (
    <figure className={cn("flex min-h-[300px] flex-col rounded-[22px] p-7 md:min-h-[340px] md:p-9", tone)}>
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.1em]">
        <span className="flex gap-0.5" aria-label="Rated 5 out of 5">
          {Array.from({ length: 5 }, (_, k) => (
            <Star key={k} size={12} />
          ))}
        </span>
        <span>{r.author}</span>
      </div>
      <blockquote className="mt-6 flex-1 font-serif text-[22px] leading-[1.3] md:text-[25px]">“{r.quote}”</blockquote>
      <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-[0.1em] opacity-80">
        {r.city} · {r.product}
      </figcaption>
    </figure>
  );
}

/** Two notes from customers either side of the piece they wrote about. */
export function Testimonials() {
  const [i, setI] = useState(0);
  const n = featuredReviews.length;
  const a = featuredReviews[i];
  const b = featuredReviews[(i + 1) % n];
  const p = getProduct(a.slug);
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const arrow = "grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-burgundy text-burgundy transition-colors duration-300 hover:bg-burgundy hover:text-cream";

  return (
    <section aria-labelledby="notes-title" className="py-20 md:py-28">
      <div className="container-site">
        <h2 id="notes-title" className="display-md mb-12 text-center text-burgundy md:mb-16">
          Notes from the <em className="italic">fitting room</em>
        </h2>
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8 lg:gap-12" aria-live="polite">
          <div key={`a${i}`} className="animate-fade-up">
            <Card r={a} tone={TONES[0]} />
          </div>
          <div className="relative mx-auto hidden w-40 md:block lg:w-52">
            {p && (
              <div key={p.id} className="bob relative aspect-[4/5] animate-fade-in overflow-hidden rounded-[18px] border-[5px] border-paper shadow-[0_24px_40px_-24px_rgb(62_33_23/0.6)]" style={{ "--r": "-6deg" } as React.CSSProperties}>
                <Image src={imagesFor(p)[0]} alt={p.name} fill sizes="208px" className="object-cover" />
              </div>
            )}
          </div>
          <div key={`b${i}`} className="animate-fade-up [animation-delay:120ms] max-md:hidden">
            <Card r={b} tone={TONES[1]} />
          </div>
        </div>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(-1)} aria-label="Previous review" className={arrow}>
            <ArrowLeft size={15} />
          </button>
          <span className="font-mono text-[12px] tabular-nums text-muted">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Next review" className={arrow}>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
