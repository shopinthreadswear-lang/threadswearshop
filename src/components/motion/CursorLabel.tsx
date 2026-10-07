"use client";

import { useEffect, useRef, useState } from "react";
import { finePointer, prefersReducedMotion } from "./useInView";
import { cn } from "@/lib/cn";

/**
 * Contextual cursor label — desktop + fine pointer only. The native cursor is never hidden;
 * a small disc follows it and names the action ("View", "Explore", "Drag") over elements
 * marked with data-cursor="…". Lerp-follow (factor 0.2/frame) keeps it feeling weighted.
 */
export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [light, setLight] = useState(false);

  useEffect(() => {
    if (!finePointer() || prefersReducedMotion()) return;
    const pos = { x: -200, y: -200, tx: -200, ty: -200 };
    let raf = 0;
    const tick = () => {
      pos.x += (pos.tx - pos.x) * 0.2;
      pos.y += (pos.ty - pos.y) * 0.2;
      if (ref.current) ref.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const move = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      const el = (e.target as Element | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(el?.dataset.cursor ?? null);
      setLight(el?.dataset.cursorTone === "light");
    };
    const out = () => setLabel(null);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", out);
    window.addEventListener("blur", out);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", out);
      window.removeEventListener("blur", out);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={cn("cursor-label", label && "is-on", light && "on-light")}>
      <span>{label}</span>
    </div>
  );
}
