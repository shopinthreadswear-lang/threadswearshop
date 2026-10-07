"use client";

import { Eyebrow } from "@/components/motion/Eyebrow";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getCollection } from "@/data/collections";
import { byCollection } from "@/data/products";
import { WordReveal } from "@/components/motion/WordReveal";
import { finePointer, prefersReducedMotion } from "@/components/motion/useInView";
import { ArrowRight } from "@/components/ui/Icons";
import type { Collection } from "@/lib/types";

const SLUGS = ["signature", "modern-tailoring", "winter-layers", "resort", "after-dark", "wedding-edit"];
const CLOTHS: Record<string, string> = {
  signature: "Goat suede · two-ply oxford · wool hopsack",
  "modern-tailoring": "Super 120s wool · 120s poplin · wool-silk",
  "winter-layers": "Wool-cashmere · lambswool · waxed cotton",
  resort: "European linen · mercerised cotton knit",
  "after-dark": "Lambskin · wool hopsack · Pima jersey",
  "wedding-edit": "Wool flannel · wool-silk · 120s poplin",
};

function Panel({ c, i, total }: { c: Collection; i: number; total: number }) {
  const items = byCollection(c.slug);
  return (
    <article className="flex w-[86vw] shrink-0 snap-center flex-col gap-6 md:w-[60vw] lg:w-auto lg:flex-row lg:items-end lg:gap-10">
      <Link href={`/collections/${c.slug}`} data-cursor="View" data-cursor-tone="light" className="group relative block aspect-[4/5] w-full shrink-0 overflow-hidden bg-charcoal lg:h-[56vh] lg:w-auto" tabIndex={-1} aria-hidden>
        <Image src={c.image} alt="" fill sizes="(max-width:1024px) 86vw, 46vh" className="img-grade object-cover transition-transform duration-[1600ms] ease-[var(--ease-lux)] group-hover:scale-[1.05]" />
      </Link>
      <div className="lg:w-[min(30vw,420px)] lg:pb-4">
        <p className="eyebrow text-[10px] text-champagne-soft">
          Collection {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <h3 className="mt-4 font-serif text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.02]">{c.name}</h3>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ivory/70">{c.tagline}</p>
        <dl className="mt-7 space-y-3 border-t border-line-dark pt-5 text-[13px]">
          <div className="flex gap-4">
            <dt className="w-20 shrink-0 text-ivory/45">Cloths</dt>
            <dd className="text-ivory/85">{CLOTHS[c.slug]}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-20 shrink-0 text-ivory/45">Pieces</dt>
            <dd className="text-ivory/85">{items.slice(0, 3).map((p) => p.name.replace(/^The /, "")).join(", ")}</dd>
          </div>
        </dl>
        <Link href={`/collections/${c.slug}`} className="group mt-8 inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.16em]">
          <span className="link-u pb-1 [background-size:100%_1px]">Explore {items.length} pieces</span>
          <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

/**
 * 06 — Featured work → collection stories. Desktop (fine pointer, motion allowed): vertical scroll drives a pinned
 * horizontal track (transform only, rAF). Otherwise a native swipe/scroll-snap row — same content, no pinning.
 */
export function CollectionStories() {
  const list = SLUGS.map(getCollection).filter(Boolean) as Collection[];
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [height, setHeight] = useState<number | undefined>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability check after hydration
    setPinned(finePointer() && !prefersReducedMotion() && window.innerWidth >= 1024);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const o = outer.current;
    const t = track.current;
    if (!o || !t) return;
    let distance = 0;
    const measure = () => {
      distance = t.scrollWidth - window.innerWidth;
      setHeight(distance + window.innerHeight);
    };
    let raf = 0;
    const update = () => {
      const r = o.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      t.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
      setProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(t);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const header = (
    <div className={`container-site mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end ${pinned ? "pt-6" : "pt-20 md:pt-28"}`}>
      <div>
        <Eyebrow light>The Collections</Eyebrow>
        <WordReveal id="collections-title" text="Six stories, one wardrobe." className="display-lg mt-5" />
      </div>
      <div className="flex items-center gap-6">
        <p className="max-w-xs text-[14px] text-ivory/60">Each collection is built around a moment — work, winter, weddings, warm evenings.</p>
        {pinned && (
          <span aria-hidden className="relative hidden h-px w-32 bg-line-dark md:block">
            <span className="absolute inset-y-0 left-0 bg-ivory" style={{ width: `${Math.max(8, progress * 100)}%` }} />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section id="collections" data-section="Collections" data-tone="dark" aria-labelledby="collections-title" className="on-dark bg-night text-ivory">
      {pinned ? (
        <div ref={outer} style={{ height }} className="relative">
          <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
            {header}
            <div ref={track} className="flex w-max gap-20 px-[var(--spacing-gutter)] pb-8 will-change-transform">
              {list.map((c, i) => (
                <Panel key={c.slug} c={c} i={i} total={list.length} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="pb-20">
          {header}
          <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-[var(--spacing-gutter)] scroll-px-[var(--spacing-gutter)]">
            {list.map((c, i) => (
              <Panel key={c.slug} c={c} i={i} total={list.length} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
