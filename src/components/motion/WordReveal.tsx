"use client";

import { createElement, Fragment, type ElementType } from "react";
import { useInViewOnce } from "./useInView";
import { cn } from "@/lib/cn";

/**
 * Masked word-by-word heading reveal (cinematic tier, ~900ms, 45ms stagger).
 * For headings only — body copy is never animated. Screen readers get the plain string.
 */
export function WordReveal({ text, as = "h2", className, delay = 0, immediate = false, id }: { text: string; as?: ElementType; className?: string; delay?: number; immediate?: boolean; id?: string }) {
  const [ref, inView] = useInViewOnce<HTMLElement>();
  const words = text.split(" ");
  return createElement(
    as,
    { ref, id, className: cn("words", (inView || immediate) && "is-in", className), style: { "--d": `${delay}ms` } as React.CSSProperties, "aria-label": text },
    words.map((w, i) => (
      <Fragment key={i}>
        <span className="w" aria-hidden>
          <span style={{ "--i": i } as React.CSSProperties}>{w}</span>
        </span>
        {i < words.length - 1 ? " " : null}
      </Fragment>
    )),
  );
}
