import { Doodle, type DoodleName } from "@/components/doodles/Doodle";
import { cn } from "@/lib/cn";

const ITEMS: [string, DoodleName][] = [
  ["Heavyweight cotton", "tee"],
  ["Cut in Mumbai", "scissors"],
  ["Collars that hold their line", "shirt"],
  ["Made in small runs", "spool"],
  ["15-day returns", "hanger"],
  ["Free shipping over ₹2,999", "button"],
  ["Mended, never binned", "needle"],
];

/** Ochre ribbon with the house promises running across it. */
export function Ticker({ className }: { className?: string }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {ITEMS.map(([t, d]) => (
        <li key={t} className="flex items-center gap-4 px-5 md:gap-5 md:px-7">
          <Doodle name={d} className="h-6 w-6 shrink-0" strokeWidth={2.2} />
          <span className="whitespace-nowrap font-mono text-[12px] font-medium uppercase tracking-[0.1em]">{t}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("ticker-wrap overflow-hidden border-y-2 border-burgundy bg-ochre py-3.5 text-burgundy", className)}>
      <p className="sr-only">{ITEMS.map(([t]) => t).join(" · ")}</p>
      <div className="ticker" aria-hidden>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
