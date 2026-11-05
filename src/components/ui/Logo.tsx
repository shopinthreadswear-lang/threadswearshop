import Link from "next/link";
import { cn } from "@/lib/cn";

/** Wordmark — one line of heavy display serif; the only serif on the site, so the name always reads as a logo. */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-block whitespace-nowrap font-[family-name:var(--font-logo)] font-extrabold leading-none tracking-[-0.01em] transition-[font-size] duration-500 ease-[var(--ease-lux)]", compact ? "text-[21px] md:text-[23px]" : "text-[22px] md:text-[27px]", className)}>
      Threads Wear
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
    <Link href="/" aria-label="Threads Wear — home" className={cn("inline-flex", className)}>
      <Wordmark compact={compact} />
    </Link>
  );
}
