"use client";

import type { ProductColor } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ColorSwatches({ colors, value, onChange, size = "sm", className }: { colors: ProductColor[]; value: string; onChange: (c: string) => void; size?: "sm" | "lg"; className?: string }) {
  return (
    <div role="radiogroup" aria-label="Colour" className={cn("flex flex-wrap items-center", size === "lg" ? "gap-3" : "gap-3.5", className)}>
      {colors.map((c) => {
        const selected = c.name === value;
        return (
          <button
            key={c.name}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c.name}
            title={c.name}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(c.name);
            }}
            className={cn(
              // Visual dot stays small; the ::before extends the touch area to ~40px.
              "relative rounded-full transition-[box-shadow] duration-300 before:absolute before:-inset-3.5 before:content-['']",
              size === "lg" ? "h-8 w-8" : "h-[13px] w-[13px]",
              selected ? "shadow-[0_0_0_1.5px_var(--color-ivory),0_0_0_2.5px_var(--color-ink)]" : "shadow-[0_0_0_1px_rgba(0,0,0,0.12)] hover:shadow-[0_0_0_1.5px_var(--color-ivory),0_0_0_2.5px_var(--color-beige)]",
            )}
            style={{ background: c.hex }}
          />
        );
      })}
    </div>
  );
}
