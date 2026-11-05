"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/cn";

/** "New Arrivals" with a row of category tabs; each tab swaps the grid below it. */
export function NewArrivals({ tabs }: { tabs: { id: string; label: string; ids: string[] }[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active)!;
  return (
    <section aria-labelledby="na-title" className="pb-16 pt-14 md:pb-20 md:pt-16">
      <div className="container-site">
        <h2 id="na-title" className="display-md text-center">
          New Arrivals
        </h2>
        <div role="tablist" aria-label="New arrivals by category" className="no-scrollbar -mx-[var(--spacing-gutter)] mt-5 flex gap-7 overflow-x-auto px-[var(--spacing-gutter)] sm:justify-center">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={t.id === active} aria-controls="na-panel" onClick={() => setActive(t.id)} className={cn("min-h-11 shrink-0 text-[12.5px] font-medium uppercase tracking-[0.06em] transition-colors duration-200", t.id === active ? "text-ink" : "text-faint hover:text-ink")}>
              {t.label}
            </button>
          ))}
        </div>
        <ul id="na-panel" role="tabpanel" aria-labelledby={`tab-${active}`} key={active} className="mt-7 grid animate-fade-in grid-cols-2 gap-x-1.5 gap-y-8 md:grid-cols-3 md:gap-x-2 md:gap-y-10 xl:grid-cols-4">
          {tab.ids.map((id) => (
            <li key={id}>
              <ProductCard productId={id} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
