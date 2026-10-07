"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROCESS } from "@/data/story";
import { Eyebrow } from "@/components/motion/Eyebrow";
import { getLenis } from "@/components/motion/SmoothScroll";
import { prefersReducedMotion } from "@/components/motion/useInView";
import { cn } from "@/lib/cn";

const N = PROCESS.length;
const STEP_VH = 85; // scroll distance per chapter

/**
 * How It's Made — a short scroll-driven film in six chapters.
 * Desktop: the section pins; scrolling advances chapters. Each photograph wipes up over the last (clip-path, 1s),
 * a giant outlined numeral and title change with it, and a chapter rail fills and lets you jump.
 * Phones: full-bleed swipe cards. Reduced motion: no pinning, a static list.
 */
export function ProcessTimeline() {
  const [mode, setMode] = useState<"film" | "cards" | "static">("cards");
  const [active, setActive] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const outer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pick = () => setMode(prefersReducedMotion() ? "static" : window.matchMedia("(min-width: 1024px)").matches ? "film" : "cards");
    pick();
    const mq = window.matchMedia("(min-width: 1024px)");
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  useEffect(() => {
    if (mode !== "film") return;
    const o = outer.current;
    if (!o) return;
    let raf = 0;
    const update = () => {
      const r = o.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(0.9999, Math.max(0, -r.top / Math.max(1, total)));
      const pos = p * N;
      setActive(Math.floor(pos));
      setStepProgress(pos - Math.floor(pos));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode]);

  const jump = useCallback((i: number) => {
    const o = outer.current;
    if (!o) return;
    const top = o.getBoundingClientRect().top + window.scrollY;
    const total = o.offsetHeight - window.innerHeight;
    const y = top + ((i + 0.02) / N) * total;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const header = (light: boolean, stacked = false) => (
    <div className={cn("flex flex-col gap-4", !stacked && "md:flex-row md:items-end md:justify-between", light && "text-ivory")}>
      <div>
        <Eyebrow light={light}>How It’s Made</Eyebrow>
        <h2 id="process-title" className="display-md mt-4 max-w-[18ch]">
          From the mill to your door, in six steps.
        </h2>
      </div>
      <p className={cn("max-w-sm text-[14.5px] leading-relaxed", light ? "text-ivory/70" : "text-muted")}>Nothing is handed to people we haven’t met. This is exactly what happens to every piece before it reaches you.</p>
    </div>
  );

  // ── Desktop: pinned film ──
  if (mode === "film") {
    const step = PROCESS[active];
    return (
      <section id="process" data-section="How it's made" data-tone="dark" aria-labelledby="process-title" className="on-dark relative bg-night text-ivory">
        <div ref={outer} style={{ height: `${N * STEP_VH + 100}vh` }} className="relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            {/* Photographs: each new chapter wipes up over the previous one */}
            {PROCESS.map((p, i) => (
              <div
                key={p.n}
                aria-hidden={i !== active}
                className="absolute inset-0 transition-[clip-path] duration-[1100ms] ease-[var(--ease-in-out-lux)]"
                style={{ clipPath: i <= active ? "inset(0 0 0 0)" : "inset(100% 0 0 0)", zIndex: i }}
              >
                <Image
                  src={p.image}
                  alt={i === active ? `${p.title}: ${p.detail}` : ""}
                  fill
                  sizes="100vw"
                  className={cn("img-grade object-cover transition-transform duration-[2400ms] ease-[var(--ease-lux)]", i === active ? "scale-100" : "scale-110")}
                />
              </div>
            ))}
            <div aria-hidden className="absolute inset-0 z-10 bg-gradient-to-r from-night/90 via-night/55 to-night/10" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-night/90 to-transparent" />

            <div className="container-site relative z-20 flex h-full flex-col pb-10 pt-[calc(60px+3.5rem)]">
              <div className="max-w-xl">{header(true, true)}</div>

              <div className="relative mt-auto grid grid-cols-12 items-end gap-8">
                {/* Giant outlined numeral */}
                <p aria-hidden className="col-span-5 select-none font-serif leading-[0.8] text-transparent" style={{ fontSize: "clamp(8rem, 15vw, 14.5rem)", WebkitTextStroke: "1px rgb(242 227 225 / 0.55)" }}>
                  <span key={step.n} className="inline-block" style={{ animation: "fade-up 800ms var(--ease-lux) both" }}>
                    {step.n}
                  </span>
                </p>
                <div key={`copy-${active}`} className="col-span-6 col-start-7 pb-6" aria-live="polite">
                  <p className="eyebrow text-[10.5px] text-champagne-soft" style={{ animation: "fade-in 600ms var(--ease-lux) 150ms both" }}>
                    Step {step.n} of 0{N} · {step.detail}
                  </p>
                  <h3 className="mt-4 font-serif text-[clamp(3rem,5.6vw,5.6rem)] leading-[0.95]">
                    <span className="line-mask">
                      <span style={{ "--d": "60ms" } as React.CSSProperties}>{step.title}</span>
                    </span>
                  </h3>
                  <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ivory/80" style={{ animation: "fade-up 800ms var(--ease-lux) 220ms both" }}>
                    {step.text}
                  </p>
                </div>
              </div>

              {/* Chapter rail */}
              <ol className="mt-16 grid grid-cols-6 gap-4" aria-label="Chapters">
                {PROCESS.map((p, i) => (
                  <li key={p.n}>
                    <button type="button" onClick={() => jump(i)} aria-current={i === active ? "step" : undefined} className="group block w-full text-left">
                      <span className="relative block h-px bg-ivory/25">
                        <span className="absolute inset-y-0 left-0 bg-ivory transition-[width] duration-200" style={{ width: i < active ? "100%" : i === active ? `${Math.max(4, stepProgress * 100)}%` : "0%" }} />
                      </span>
                      <span className={cn("mt-3 flex items-baseline gap-2 text-[11px] uppercase tracking-[0.16em] transition-colors duration-300", i === active ? "text-ivory" : "text-ivory/45 group-hover:text-ivory/80")}>
                        <span className="tabular-nums">{p.n}</span> {p.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Phones / tablets: full-bleed swipe cards ──
  if (mode === "cards") {
    return (
      <section id="process" data-section="How it's made" data-tone="dark" aria-labelledby="process-title" className="on-dark bg-night py-16 text-ivory md:py-24">
        <div className="container-site">{header(true)}</div>
        <ol className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--spacing-gutter)] scroll-px-[var(--spacing-gutter)]" aria-label="Six steps — swipe to see each">
          {PROCESS.map((p) => (
            <li key={p.n} className="relative aspect-[3/4] w-[80vw] max-w-[380px] shrink-0 snap-start overflow-hidden">
              <Image src={p.image} alt={`${p.title}: ${p.detail}`} fill sizes="80vw" className="img-grade object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/10" />
              <p aria-hidden className="absolute left-4 top-2 font-serif text-[96px] leading-none text-transparent" style={{ WebkitTextStroke: "1px rgb(242 227 225 / 0.7)" }}>
                {p.n}
              </p>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="eyebrow text-[10.5px] text-champagne-soft">{p.detail}</p>
                <h3 className="mt-2 font-serif text-[34px] leading-none">{p.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ivory/80">{p.text}</p>
              </div>
            </li>
          ))}
          <li aria-hidden className="w-1 shrink-0" />
        </ol>
        <p className="container-site mt-4 text-[12px] text-ivory/50">Swipe to follow a piece from the mill to your door →</p>
      </section>
    );
  }

  // ── Reduced motion: calm static list ──
  return (
    <section id="process" data-section="How it's made" aria-labelledby="process-title" className="border-t border-line section-y">
      <div className="container-site">
        {header(false)}
        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS.map((p) => (
            <li key={p.n}>
              <div className="relative aspect-[4/3] overflow-hidden bg-bone">
                <Image src={p.image} alt={`${p.title}: ${p.detail}`} fill sizes="(max-width:640px) 100vw, 33vw" className="img-grade object-cover" />
              </div>
              <p className="mt-4 text-[11px] tabular-nums text-muted">
                {p.n} · {p.detail}
              </p>
              <h3 className="mt-1 font-serif text-[28px] leading-tight">{p.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-charcoal">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
