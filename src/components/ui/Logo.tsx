import Link from "next/link";
import { cn } from "@/lib/cn";

/** Stacked wordmark — "Threads" over an italic "Ware", in the soft display serif, like a shop sign. */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center font-serif font-semibold leading-[0.8] tracking-[-0.03em] whitespace-nowrap [font-variation-settings:'SOFT'_100,'WONK'_1] transition-[font-size] duration-500 ease-[var(--ease-lux)]",
        compact ? "text-[19px] md:text-[22px]" : "text-[21px] sm:text-[24px] md:text-[29px]",
        className,
      )}
    >
      <span>Threads</span>
      <span className="italic">Ware</span>
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
