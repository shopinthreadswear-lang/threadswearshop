"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Wayfinding rail for long pages: reads every [data-section="Label"] element and highlights the one
 * occupying the middle of the viewport. Desktop only; keyboard-operable anchor links.
 */
export function SectionIndex() {
  const [items, setItems] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sections are discovered from the DOM
    setItems(els.map((el) => ({ id: el.id, label: el.dataset.section! })));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            setActive(e.target.id);
            setDark((e.target as HTMLElement).dataset.tone === "dark");
          }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  if (!items.length) return null;
  return (
    <nav aria-label="Page sections" className={cn("fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 transition-[color,opacity] duration-500 xl:block", dark ? "text-ivory" : "text-ink", active === items[0]?.id && "pointer-events-none opacity-0")}>
      <ol className="flex flex-col items-end gap-3">
        {items.map((s, i) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={on ? "location" : undefined} className="group flex items-center gap-3 py-0.5">
                <span className={cn("whitespace-nowrap px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-0 translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100", dark ? "bg-night/80" : "bg-ivory/90")}>
                  {String(i + 1).padStart(2, "0")} {s.label}
                </span>
                <span className={cn("block h-px bg-current transition-all duration-500 ease-[var(--ease-lux)]", on ? "w-8 opacity-100" : "w-3 opacity-40 group-hover:w-5")} />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
