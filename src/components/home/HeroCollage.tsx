"use client";

import Image from "next/image";
import Link from "next/link";
import { Notch } from "./Notch";
import { LineReveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import { IMG } from "@/data/images";
import { cn } from "@/lib/cn";

type Card = { img: string; label: string; href: string; alt: string; focus?: string; notch?: "left" | "right"; aspect: string; priority?: boolean };

// Five columns, bottom-aligned so the tops stagger (outer high → centre low), as in a gallery wall.
const COLS: Card[][] = [
  [
    { img: IMG.manSuedeStreet, label: "Outerwear", href: "/men/jackets", alt: "Man in the Mayfair suede jacket", aspect: "aspect-[6/7]", focus: "50% 25%" },
    { img: IMG.teeStripeModel, label: "T-Shirts", href: "/men/t-shirts", alt: "Man in a Breton stripe tee", aspect: "aspect-[15/8]", focus: "50% 30%" },
  ],
  [{ img: IMG.coatWalk, label: "Coats", href: "/men/coats", alt: "Man walking in a camel overcoat", aspect: "aspect-[2/3]", focus: "50% 40%", notch: "right", priority: true }],
  [],
  [{ img: IMG.walkSuit, label: "Designer Wear", href: "/men/designer-wear", alt: "Man in a navy two-piece suit", aspect: "aspect-[2/3.1]", focus: "50% 30%", notch: "left", priority: true }],
  [
    { img: IMG.manWhiteShirt, label: "Shirts", href: "/men/shirts", alt: "Man in a white oxford shirt", aspect: "aspect-[6/7]", focus: "50% 22%", notch: "right" },
    { img: IMG.teeBlackModel2, label: "Heavyweight Tees", href: "/products/mercer-heavyweight-tee", alt: "Man in a black heavyweight tee", aspect: "aspect-[15/8]", focus: "50% 25%" },
  ],
];
const CENTER: Card = { img: IMG.manPortraitKnit, label: "Knitwear", href: "/men/knitwear", alt: "Portrait of a man in a shawl-collar cardigan", aspect: "aspect-[1/1.02]", focus: "50% 30%", notch: "right", priority: true };


function PhotoCard({ c, delay, className }: { c: Card; delay: number; className?: string }) {
  // The notch sits *outside* the rounded clip so it fully covers the clip's anti-aliased corner.
  return (
    <div className={cn("relative", c.aspect, className)} style={{ animation: `fade-up 900ms var(--ease-lux) ${delay}ms both` }}>
      <Link href={c.href} data-cursor="View" className="group absolute inset-0 block overflow-hidden rounded-[20px] bg-bone">
        <Image src={c.img} alt={c.alt} fill priority={c.priority} sizes="(max-width: 768px) 62vw, 20vw" className="img-grade object-cover transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.06]" style={{ objectPosition: c.focus }} />
        <span className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-between rounded-full bg-ivory/90 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-0 backdrop-blur-sm transition-all duration-500 ease-[var(--ease-lux)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          {c.label} <ArrowRight size={12} />
        </span>
      </Link>
      {c.notch && <Notch side={c.notch} />}
    </div>
  );
}

/**
 * 01 — Hero, gallery-wall layout: one bold promise, five columns of people wearing the clothes,
 * and one clear way in (Explore Collections).
 */
export function HeroCollage() {

  return (
    <section id="intro" data-section="Intro" aria-labelledby="hero-title" className="relative bg-ivory">
      <div className="container-site pb-4 pt-10 md:pb-6 md:pt-14">
        {/* ── Headline ── */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 id="hero-title" className="text-center font-serif text-[clamp(2.6rem,6.6vw,6.2rem)] font-normal leading-[0.98] tracking-[-0.015em] text-ink">
            <LineReveal lines={["The New Standard in", <>Shirts, Tees &amp; <em className="font-serif italic text-champagne">Tailoring</em></>]} baseDelay={100} step={110} />
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted" style={{ animation: "fade-up 900ms var(--ease-lux) 450ms both" }}>
            Premium menswear, designed in Mumbai and made to be worn for years.
          </p>
        </div>

        {/* ── Gallery wall (desktop / tablet) ── */}
        <div className="mt-8 hidden grid-cols-5 items-end gap-4 md:grid lg:mt-6">
          {COLS.map((col, ci) =>
            ci === 2 ? (
              <div key="center" className="flex flex-col items-center gap-3">
                <PhotoCard c={CENTER} delay={420} className="w-full" />
                <Link href="/collections" className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3.5 text-[13.5px] font-semibold text-wine transition-colors duration-300 hover:bg-champagne-soft" style={{ animation: "fade-up 900ms var(--ease-lux) 560ms both" }}>
                  Explore Collections
                  <ArrowRight size={14} className="-rotate-45 text-wine transition-transform duration-300 group-hover:rotate-0" />
                </Link>
              </div>
            ) : (
              <div key={ci} className="flex flex-col gap-3">
                {col.map((c, k) => (
                  <PhotoCard key={c.label} c={c} delay={200 + Math.abs(ci - 2) * 60 + k * 90} />
                ))}
              </div>
            ),
          )}
        </div>

        {/* ── Phones: swipeable strip ── */}
        <div className="mt-8 md:hidden">
          <div className="no-scrollbar -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory items-end gap-3 overflow-x-auto px-[var(--spacing-gutter)]">
            {[COLS[1][0], CENTER, COLS[3][0], COLS[0][0], COLS[4][0]].map((c, k) => (
              <PhotoCard key={c.label} c={{ ...c, aspect: k % 2 ? "aspect-[3/4]" : "aspect-[2/3]" }} delay={150 + k * 70} className="w-[62vw] shrink-0 snap-center" />
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Link href="/collections" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3.5 text-[13.5px] font-semibold text-wine">
              Explore Collections <ArrowRight size={14} className="-rotate-45 text-wine" />
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}
