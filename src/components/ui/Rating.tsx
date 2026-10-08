import { Star } from "./Icons";
import { cn } from "@/lib/cn";

export function Stars({ value, size = 13, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[2px] text-ink", className)} role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} filled={false} className="absolute inset-0 opacity-30" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Rating({ value, count, className, href }: { value: number; count?: number; className?: string; href?: string }) {
  const inner = (
    <>
      <Stars value={value} />
      <span className="text-[13px] text-ink">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-[13px] text-muted">({count} Reviews)</span>}
    </>
  );
  return href ? (
    <a href={href} className={cn("hit inline-flex items-center gap-2 hover:opacity-70 transition-opacity", className)}>
      {inner}
    </a>
  ) : (
    <span className={cn("inline-flex items-center gap-2", className)}>{inner}</span>
  );
}
