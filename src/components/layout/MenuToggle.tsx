"use client";

import { cn } from "@/lib/cn";

/** Two-line menu icon that morphs into a close "X" (component tier, 450ms). */
export function MenuToggle({ open, onClick, className, label }: { open: boolean; onClick: () => void; className?: string; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={open} aria-label={label ?? (open ? "Close menu" : "Open menu")} className={cn("relative grid h-11 w-11 place-items-center", className)}>
      <span aria-hidden className="relative block h-3 w-[22px]">
        <span className={cn("absolute left-0 h-px w-full bg-current transition-[transform,top,width] duration-[450ms] ease-[var(--ease-lux)]", open ? "top-1/2 rotate-45" : "top-0")} />
        <span className={cn("absolute left-0 h-px bg-current transition-[transform,top,width] duration-[450ms] ease-[var(--ease-lux)]", open ? "top-1/2 w-full -rotate-45" : "top-full w-[70%]")} />
      </span>
    </button>
  );
}
