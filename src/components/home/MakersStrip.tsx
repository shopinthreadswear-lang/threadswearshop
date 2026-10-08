import { VelocityMarquee } from "@/components/motion/Scroll";
import { cn } from "@/lib/cn";

/** Where each cloth comes from, set as a row of little shop-sign marks (each with its own type treatment). */
const MAKERS: [string, string, string][] = [
  ["Cotton", "Tiruppur", "font-serif italic text-[26px] font-semibold"],
  ["Cut & sewn", "Mumbai", "font-mono text-[15px] uppercase tracking-[0.18em] border-2 border-current rounded-full px-4 py-1.5"],
  ["Linen", "Kolkata", "font-serif text-[28px] font-bold tracking-[-0.03em]"],
  ["Wool", "Ludhiana", "font-mono text-[13px] uppercase tracking-[0.3em]"],
  ["Suede", "Kanpur", "font-serif italic text-[30px] font-black"],
  ["Indigo", "Ahmedabad", "font-serif text-[21px] uppercase tracking-[0.2em] border-y-2 border-current py-1"],
  ["Buttons", "Moradabad", "font-mono text-[15px] font-medium"],
];

export function MakersStrip() {
  const row = (
    <ul className="flex shrink-0 items-center">
      {MAKERS.map(([what, where, cls]) => (
        <li key={where} className="flex flex-col items-center px-8 text-burgundy md:px-12">
          <span className={cn("whitespace-nowrap leading-none", cls)}>{where}</span>
          <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{what}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Where our clothes are made" className="border-y border-line py-10">
      <p className="sr-only">Cotton from Tiruppur, cut and sewn in Mumbai, linen from Kolkata, wool from Ludhiana, suede from Kanpur, indigo from Ahmedabad and buttons from Moradabad.</p>
      <VelocityMarquee speed={1.4}>{row}</VelocityMarquee>
    </section>
  );
}
