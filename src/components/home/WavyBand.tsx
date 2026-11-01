"use client";

import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const PHRASE = "Dress Loud ★ Wear It Your Way ★ Made in Mumbai ★ ";

/**
 * A thick acid-yellow ribbon that waves across the page, with type running along its curve.
 * The text glides continuously and speeds up while the reader scrolls. Static under reduced motion.
 */
export function WavyBand({ className, phrase = PHRASE }: { className?: string; phrase?: string }) {
  const tp = useRef<SVGTextPathElement>(null);
  const id = `wave-${useId().replace(/:/g, "")}`;
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let off = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    let boost = 0;
    // Wrap after exactly one phrase so the loop is seamless: phrase length as a percentage of the path.
    const textEl = tp.current?.parentElement as unknown as SVGTextContentElement | null;
    const pathEl = document.getElementById(id) as SVGPathElement | null;
    const period = textEl && pathEl ? (textEl.getComputedTextLength() / 12 / pathEl.getTotalLength()) * 100 : 20;
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const dy = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      boost = Math.min(6, boost * 0.92 + dy * 0.02);
      off -= (dt / 1000) * (1.6 + boost); // percent of path per second
      if (off < -period) off += period;
      tp.current?.setAttribute("startOffset", `${off}%`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, id]);

  // One wavelength every 700 units across a 2800-wide band, drawn twice as wide so the text can scroll.
  const wave = "M-1400 90 C -1225 20, -1050 20, -875 90 S -525 160, -350 90 S 0 20, 175 90 S 525 160, 700 90 S 1050 20, 1225 90 S 1575 160, 1750 90 S 2100 20, 2275 90 S 2625 160, 2800 90 S 3150 20, 3325 90 S 3675 160, 3850 90";
  const text = phrase.repeat(12);
  return (
    <div aria-hidden className={className}>
      <svg viewBox="0 0 1400 180" preserveAspectRatio="xMidYMid slice" className="block h-[88px] w-full overflow-visible sm:h-[120px] md:h-[150px]">
        <defs>
          <path id={id} d={wave} />
        </defs>
        <use href={`#${id}`} fill="none" stroke="var(--color-ink)" strokeOpacity="0.25" strokeWidth="80" transform="translate(0 8)" />
        <use href={`#${id}`} fill="none" stroke="var(--color-acid)" strokeWidth="80" />
        <text dy="17" className="fill-[var(--color-ink)] font-serif text-[46px] font-extrabold uppercase tracking-[-0.01em] [font-variation-settings:'wdth'_75,'opsz'_96]">
          <textPath ref={tp} href={`#${id}`} startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
