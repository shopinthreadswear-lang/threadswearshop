"use client";

import { cn } from "@/lib/cn";

export function SizeSelector({ sizes, value, onChange, stockFor, error }: { sizes: string[]; value: string | null; onChange: (s: string) => void; stockFor: (s: string) => number; error?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Select your size" aria-invalid={error || undefined} className={cn("grid gap-2", sizes.length > 4 ? "grid-cols-6 max-sm:grid-cols-3" : "grid-cols-4")}>
      {sizes.map((s) => {
        const stock = stockFor(s);
        const out = stock <= 0;
        const selected = value === s;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${s}${out ? " — out of stock" : stock <= 5 ? ` — only ${stock} left` : ""}`}
            onClick={() => onChange(s)}
            className={cn(
              "relative h-12 border text-[12.5px] tracking-[0.06em] transition-[background,color,border-color] duration-300",
              selected ? "border-ink bg-ink text-ivory" : error ? "border-error/60" : "border-line hover:border-ink",
              out && !selected && "text-faint",
            )}
          >
            <span className={cn(out && "line-through decoration-faint/70")}>{s}</span>
            {!out && stock <= 5 && <span aria-hidden className={cn("absolute right-1.5 top-1.5 h-1 w-1 rounded-full", selected ? "bg-champagne-soft" : "bg-warning")} />}
          </button>
        );
      })}
    </div>
  );
}
