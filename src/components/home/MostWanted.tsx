"use client";

import { Eyebrow } from "@/components/motion/Eyebrow";
import { useState } from "react";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { TextLink } from "@/components/ui/CTA";
import { WordReveal } from "@/components/motion/WordReveal";
import { cn } from "@/lib/cn";

/** Best sellers + trending merged into one tabbed rail (previously two near-identical grids). */
export function MostWanted({ tabs }: { tabs: { id: string; label: string; href: string; ids: string[] }[] }) {
  const [i, setI] = useState(0);
  const t = tabs[i];
  return (
    <section id="most-wanted" aria-labelledby="mw-title" className="section-y">
      <div className="container-site">
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <div>
            <Eyebrow>Most Wanted</Eyebrow>
            <WordReveal id="mw-title" text="What everyone is wearing." className="display-md mt-4" />
          </div>
          <div className="flex items-center gap-8">
            <div role="tablist" aria-label="Product lists" className="flex gap-6">
              {tabs.map((x, idx) => (
                <button key={x.id} role="tab" aria-selected={idx === i} aria-controls="mw-panel" onClick={() => setI(idx)} className={cn("border-b pb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300", idx === i ? "border-ink text-ink" : "border-transparent text-faint hover:text-ink")}>
                  {x.label}
                </button>
              ))}
            </div>
            <TextLink href={t.href} className="hidden sm:inline-flex">
              View all
            </TextLink>
          </div>
        </div>
        <div id="mw-panel" role="tabpanel" key={t.id} className="page-enter">
          <ProductCarousel ids={t.ids} label={t.label} />
        </div>
      </div>
    </section>
  );
}
