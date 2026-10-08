"use client";

import { useState } from "react";
import { sizeCharts, howToMeasure, chartForCategory, type ChartKey } from "@/data/sizeGuide";
import { useStore } from "@/components/providers/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

export function SizeGuideContent({ initial = "tops" as ChartKey, showAll = false }: { initial?: ChartKey; showAll?: boolean }) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [chart, setChart] = useState<ChartKey>(initial);
  const keys = Object.keys(sizeCharts) as ChartKey[];
  const conv = (v: string | number, col: number) => (typeof v === "number" && col > 0 ? (unit === "cm" ? v : +(v / 2.54).toFixed(1)) : v);
  const render = (k: ChartKey) => {
    const c = sizeCharts[k];
    return (
      <div key={k} className="mb-10">
        {showAll && <h3 className="display-sm mb-4">{c.label}</h3>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-[13.5px]">
            <caption className="sr-only">{c.label} measurements in {unit === "cm" ? "centimetres" : "inches"}</caption>
            <thead>
              <tr>
                {c.columns.map((h) => (
                  <th key={h} scope="col" className="border-b border-ink py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.rows.map((r) => (
                <tr key={String(r[0])} className="border-b border-line">
                  {r.map((v, i) => (i === 0 ? <th key={i} scope="row" className="py-3 pr-4 text-left font-semibold">{v}</th> : <td key={i} className="py-3 pr-4 tabular-nums text-charcoal">{conv(v, i)}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] text-muted">{c.note}</p>
      </div>
    );
  };
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {!showAll && (
          <div className="flex flex-wrap gap-x-5 gap-y-2" role="tablist" aria-label="Size chart">
            {keys.map((k) => (
              <button key={k} type="button" role="tab" aria-selected={chart === k} onClick={() => setChart(k)} className={cn("pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors", chart === k ? "border-b border-ink text-ink" : "text-faint hover:text-ink")}>
                {k === "tops" ? "Tops & Shirts" : "Tailoring"}
              </button>
            ))}
          </div>
        )}
        <div className="flex border border-line p-0.5" role="group" aria-label="Units">
          {(["cm", "in"] as const).map((u) => (
            <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)} className={cn("min-h-10 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors", unit === u ? "bg-ink text-ivory" : "text-muted")}>
              {u === "cm" ? "CM" : "Inch"}
            </button>
          ))}
        </div>
      </div>
      {showAll ? keys.map(render) : render(chart)}
      <div className="mt-4 border-t border-line pt-8">
        <h3 className="label-sm mb-5">How to Measure</h3>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {howToMeasure.map((m) => (
            <div key={m.title}>
              <dt className="font-serif text-[19px]">{m.title}</dt>
              <dd className="mt-1 text-[13.5px] leading-relaxed text-muted">{m.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[13px] text-muted">Still unsure? Our stylists are on WhatsApp Monday–Saturday to recommend your size.</p>
      </div>
    </div>
  );
}

export function SizeGuideModal() {
  const { sizeGuide, closeSizeGuide } = useStore();
  return (
    <Modal open={sizeGuide.open} onClose={closeSizeGuide} title="Size Guide" wide>
      <SizeGuideContent key={sizeGuide.category ?? "x"} initial={chartForCategory(sizeGuide.category)} />
    </Modal>
  );
}
