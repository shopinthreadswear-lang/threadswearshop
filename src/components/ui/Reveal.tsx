"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Scroll-triggered entrance. Uses IntersectionObserver + CSS (no JS animation cost). */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  variant = "fade",
  ...rest
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "image";
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const T = Tag as unknown as React.FC<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
  return (
    <T ref={ref} className={cn(variant === "image" ? "reveal-img" : "reveal", className)} style={{ "--d": `${delay}ms` } as React.CSSProperties} {...rest}>
      {children}
    </T>
  );
}

/** Line-by-line masked headline reveal (runs on mount — use for above-the-fold heroes). */
export function LineReveal({ lines, className, baseDelay = 150, step = 110 }: { lines: ReactNode[]; className?: string; baseDelay?: number; step?: number }) {
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="line-mask">
          <span style={{ "--d": `${baseDelay + i * step}ms` } as React.CSSProperties}>{l}</span>
        </span>
      ))}
    </span>
  );
}
