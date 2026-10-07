import Link from "next/link";
import { cn } from "@/lib/cn";

/** Typographic wordmark. Wide-tracked serif caps with a hairline divider — works in black, white, embossed and on packaging. */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-serif font-medium uppercase leading-none whitespace-nowrap transition-[font-size,letter-spacing] duration-500 ease-[var(--ease-lux)]",
        compact ? "text-[15px] tracking-[0.24em] sm:text-[19px] sm:tracking-[0.3em] md:text-[22px]" : "text-[16px] tracking-[0.24em] sm:text-[21px] sm:tracking-[0.32em] md:text-[27px] md:tracking-[0.36em]",
        className,
      )}
    >
      Threads
      <span aria-hidden className="mx-[0.42em] inline-block h-[0.8em] w-px bg-current opacity-50" />
      Ware
    </span>
  );
}

/** TW monogram — interlocked serif letters within a hairline square. */
export function Monogram({ size = 44, className, animated = false }: { size?: number; className?: string; animated?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} aria-hidden>
      <rect
        x="1"
        y="1"
        width="58"
        height="58"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        style={animated ? { strokeDasharray: 240, strokeDashoffset: 240, animation: "loader-draw 900ms var(--ease-in-out-lux) forwards" } : undefined}
      />
      <text x="30" y="39.5" textAnchor="middle" fontFamily="var(--font-display), Georgia, serif" fontSize="25" letterSpacing="-1.5" fill="currentColor">
        TW
      </text>
    </svg>
  );
}

export function LogoLink({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" aria-label="Threads Ware — home" className={cn("inline-flex", className)}>
      <Wordmark compact={compact} />
    </Link>
  );
}
