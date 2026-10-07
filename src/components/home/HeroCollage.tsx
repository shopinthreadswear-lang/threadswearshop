"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Notch } from "./Notch";
import { LookbookModal } from "./LookbookModal";
import { LineReveal } from "@/components/ui/Reveal";
import { ArrowRight, Plus, Sparkle } from "@/components/ui/Icons";
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

const TEASERS = [
  { tag: "Lifestyle", title: "Set up your wardrobe with the new season", href: "/collections/new-season" },
  { tag: "Tailoring", title: "Designer wear for the days that matter", href: "/men/designer-wear" },
  { tag: "Craft", title: "Six details that make a better shirt", href: "#anatomy" },
];

const AVATARS = [IMG.manCasualSeated, IMG.manHat, IMG.manWindow];

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
 * and two ways in (Explore Collections, or watch the lookbook). Bottom row: a real customer quote + a stepping teaser.
 */
export function HeroCollage() {
  const [film, setFilm] = useState(false);
  const [t, setT] = useState(0);
  const teaser = TEASERS[t];

  return (
    <section id="intro" data-section="Intro" aria-labelledby="hero-title" className="relative bg-ivory">
      <div className="container-site pb-14 pt-10 md:pb-20 md:pt-14">
        {/* ── Headline row ── */}
        <div className="relative grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
          <button
            type="button"
            onClick={() => setFilm(true)}
            className="group relative mx-auto hidden h-[104px] w-[104px] shrink-0 place-items-center lg:grid"
            aria-label="Watch the lookbook — six looks from the new collection"
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_18s_linear_infinite] motion-reduce:animate-none" aria-hidden>
              <defs>
                <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
              </defs>
              <text fontSize="9.2" letterSpacing="2.6" fill="currentColor" className="font-sans uppercase">
                <textPath href="#badge-circle">Watch the lookbook · AW 26 ·</textPath>
              </text>
            </svg>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-ivory transition-transform duration-300 ease-[var(--ease-lux)] group-hover:scale-110">
              <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden>
                <path d="M1 1l10 6-10 6V1z" fill="currentColor" />
              </svg>
            </span>
          </button>

          <h1 id="hero-title" className="text-center font-sans text-[clamp(2.3rem,6.2vw,5.6rem)] font-bold leading-[1.02] tracking-[-0.04em] text-ink">
            <LineReveal lines={["The New Standard in", "Shirts, Tees & Tailoring"]} baseDelay={100} step={110} />
          </h1>

          <a href="#reviews" className="group mx-auto flex flex-col items-center gap-2 lg:items-end" aria-label="Rated 4.8 out of 5 by 2,400+ customers — read reviews">
            <span className="flex items-center">
              {AVATARS.map((src, k) => (
                <span key={src} className={cn("relative h-11 w-11 overflow-hidden rounded-full ring-[3px] ring-ivory", k > 0 && "-ml-3")}>
                  <Image src={src} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
              <span className="-ml-3 grid h-11 w-11 place-items-center rounded-full bg-ink text-ivory ring-[3px] ring-ivory transition-transform duration-300 group-hover:scale-105">
                <Plus size={16} />
              </span>
            </span>
            <span className="text-[11px] tracking-wide text-muted">★ 4.8 · 2,400+ customers</span>
          </a>
        </div>

        {/* ── Gallery wall (desktop / tablet) ── */}
        <div className="mt-8 hidden grid-cols-5 items-end gap-4 md:grid lg:mt-6">
          {COLS.map((col, ci) =>
            ci === 2 ? (
              <div key="center" className="flex flex-col items-center gap-3">
                <Sparkle size={22} className="text-champagne" style={{ animation: "fade-in 900ms var(--ease-lux) 500ms both" }} />
                <PhotoCard c={CENTER} delay={420} className="w-full" />
                <Link href="/collections" className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-burgundy px-6 py-3.5 text-[13.5px] font-semibold text-ivory transition-colors duration-300 hover:bg-burgundy-deep" style={{ animation: "fade-up 900ms var(--ease-lux) 560ms both" }}>
                  Explore Collections
                  <ArrowRight size={14} className="-rotate-45 text-champagne-soft transition-transform duration-300 group-hover:rotate-0" />
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
            <Link href="/collections" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-burgundy px-6 py-3.5 text-[13.5px] font-semibold text-ivory">
              Explore Collections <ArrowRight size={14} className="-rotate-45 text-champagne-soft" />
            </Link>
            <button type="button" onClick={() => setFilm(true)} aria-label="Watch the lookbook" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink">
              <svg width="11" height="13" viewBox="0 0 12 14" aria-hidden>
                <path d="M1 1l10 6-10 6V1z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Bottom row: customer quote + stepping teaser ── */}
        <div className="mt-14 grid items-end gap-10 md:mt-16 md:grid-cols-2">
          <figure className="max-w-sm">
            <span aria-hidden className="block font-serif text-[64px] leading-[0.5] text-faint">“</span>
            <blockquote className="mt-4 text-[14px] leading-relaxed text-charcoal">Threads Ware’s shirts are exactly what I needed to upgrade my wardrobe — the fabric, the fit and the finishing are on another level.</blockquote>
            <figcaption className="mt-3 flex items-center gap-3">
              <span className="relative inline-block px-1 font-serif text-[26px] italic leading-none">
                <span aria-hidden className="absolute inset-x-0 bottom-0.5 h-3 bg-champagne-soft/60" />
                <span className="relative">Rohan M.</span>
              </span>
              <span className="text-[12px] text-muted">Verified buyer, Mumbai</span>
            </figcaption>
          </figure>

          <div className="md:justify-self-end md:pl-10">
            <div className="flex w-full max-w-sm items-start justify-between gap-6">
              <p className="flex items-baseline gap-3">
                <span className="font-sans text-[44px] font-light leading-none tabular-nums">{String(t + 1).padStart(2, "0")}</span>
                <span className="text-[12px] text-muted">{teaser.tag}</span>
              </p>
              <button type="button" onClick={() => setT((x) => (x + 1) % TEASERS.length)} aria-label={`Next: ${TEASERS[(t + 1) % TEASERS.length].title}`} className="grid h-11 w-11 place-items-center rounded-full transition-colors duration-300 hover:bg-ink hover:text-ivory">
                <ArrowRight size={18} />
              </button>
            </div>
            <Link key={t} href={teaser.href} className="mt-3 block max-w-sm text-[22px] font-bold leading-snug tracking-[-0.02em] hover:underline hover:underline-offset-4" style={{ animation: "fade-up 500ms var(--ease-lux) both" }} aria-live="polite">
              {teaser.title}
            </Link>
          </div>
        </div>
      </div>

      <LookbookModal open={film} onClose={() => setFilm(false)} />
    </section>
  );
}
