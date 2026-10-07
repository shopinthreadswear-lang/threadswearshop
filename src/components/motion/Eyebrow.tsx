"use client";

import type { ReactNode } from "react";
import { useInViewOnce } from "./useInView";
import { cn } from "@/lib/cn";

/**
 * Section label with a hairline that draws in (600ms) as it enters the viewport, then the text slides after it.
 * The house signature for every section on the homepage.
 */
export function Eyebrow({ children, light = false, className, center = false }: { children: ReactNode; light?: boolean; className?: string; center?: boolean }) {
  const [ref, inView] = useInViewOnce<HTMLParagraphElement>();
  return (
    <p ref={ref} className={cn("eyebrow flex items-center gap-3", center && "justify-center", light ? "text-champagne-soft" : "text-champagne", className)}>
      <span aria-hidden className={cn("block h-px w-7 origin-left bg-current transition-transform duration-[600ms] ease-[var(--ease-lux)] motion-reduce:transition-none", inView ? "scale-x-100" : "scale-x-0")} />
      <span className={cn("transition-[opacity,transform] duration-[600ms] ease-[var(--ease-lux)] [transition-delay:150ms] motion-reduce:transition-none", inView ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0")}>{children}</span>
    </p>
  );
}
