import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/cn";

/** Hand-drawn wave that sits under a section title and draws itself in. */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 10" fill="none" aria-hidden className={cn("squiggle h-2.5 w-11", className)}>
      <path d="M2 6.5c3.3-4 6.7-4 10 0s6.7 4 10 0 6.7-4 10 0 6.7 4 10 0" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" pathLength={1} />
    </svg>
  );
}

/**
 * Centred section title: heavy uppercase heading (with an optional coloured accent), one quiet line under it,
 * and the little wave. Rises in as it enters view.
 */
export function SectionTitle({ id, title, accent, sub, light = false, className, align = "center" }: { id?: string; title: string; accent?: string; sub?: ReactNode; light?: boolean; className?: string; align?: "center" | "left" }) {
  return (
    <Reveal className={cn("mb-10 md:mb-14", align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl", className)}>
      <h2 id={id} className={cn("display-md text-balance", light ? "text-cream" : "text-ink")}>
        {title}
        {accent && <span className={light ? " text-champagne-soft" : " text-burgundy"}> {accent}</span>}
      </h2>
      {sub && <p className={cn("mt-3 text-[13.5px] font-semibold", light ? "text-cream/75" : "text-charcoal")}>{sub}</p>}
      <Squiggle className={cn("mt-4", align === "center" && "mx-auto", light ? "text-ochre" : "text-burgundy")} />
    </Reveal>
  );
}
