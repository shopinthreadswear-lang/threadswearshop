import { Doodle, type DoodleName } from "@/components/doodles/Doodle";
import { VelocityMarquee } from "@/components/motion/Scroll";
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

/** Ochre ribbon with the house promises running across it — it races and reverses with the reader's scroll. */
export function Ticker({ className }: { className?: string }) {
  const row = (
    <ul className="flex shrink-0 items-center">
      {ITEMS.map(([t, d]) => (
        <li key={t} className="flex items-center gap-4 px-5 md:gap-5 md:px-7">
          <Doodle name={d} className="h-6 w-6 shrink-0" strokeWidth={2.2} />
          <span className="whitespace-nowrap font-mono text-[12px] font-medium uppercase tracking-[0.1em]">{t}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("relative z-10 -my-px border-y-2 border-burgundy bg-ochre py-3.5 text-burgundy", className)}>
      <p className="sr-only">{ITEMS.map(([t]) => t).join(" · ")}</p>
      <VelocityMarquee speed={2.4}>{row}</VelocityMarquee>
    </div>
  );
}
