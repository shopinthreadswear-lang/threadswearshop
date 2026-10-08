import Image from "next/image";
import { DealIn, Draggable, SpringHeading } from "@/components/motion/Scroll";
import { Instagram } from "@/components/ui/Icons";
import { IMG } from "@/data/images";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

const SHOTS = [
  { img: IMG.manDenimJacket, alt: "Man in a denim jacket on a rooftop", tilt: "-rotate-[3deg]", focus: "50% 30%" },
  { img: IMG.rackWarm, alt: "A rail of shirts and jackets in warm light", tilt: "rotate-[2deg] md:translate-y-8", focus: "50% 50%" },
  { img: IMG.manRaglan, alt: "Man in a raglan tee sitting on a boardwalk", tilt: "rotate-[-1.5deg]", focus: "50% 40%" },
];

/** Customer and studio snapshots, scattered like prints on a table. */
export function InTheWild() {
  return (
    <section aria-labelledby="wild-title" className="overflow-hidden pb-24 pt-20 md:pb-32 md:pt-28">
      <div className="container-site">
        <SpringHeading id="wild-title" className="display-md text-center text-burgundy" parts={["Threads Ware", { em: "in the wild" }]} />
        <p className="mb-12 mt-3 hidden text-center font-mono text-[11.5px] uppercase tracking-[0.1em] text-muted md:mb-16 md:block">Go on — pick them up and move them around</p>
        <div className="mb-12 md:hidden" />
        <ul className="no-scrollbar -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--spacing-gutter)] py-4 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 lg:gap-12">
          {SHOTS.map((s, i) => (
            <DealIn as="li" key={s.alt} index={i} className="relative w-[72vw] shrink-0 snap-center md:w-auto">
              <Draggable>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${s.alt} — see more on Instagram`} className={cn("group block overflow-hidden rounded-[22px] border-[6px] border-paper shadow-[0_24px_44px_-28px_rgb(62_33_23/0.55)] transition-transform duration-700 ease-[var(--ease-lux)] hover:rotate-0", s.tilt)}>
                <div className="relative aspect-[4/5]">
                  <Image src={s.img} alt="" fill sizes="(max-width:768px) 72vw, 30vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.05]" style={{ objectPosition: s.focus }} />
                </div>
              </a>
              </Draggable>
              {i === 1 && (
                <span className="bob absolute -right-2 -top-3 z-10 inline-flex items-center gap-2 rounded-full bg-burgundy px-4 py-2 font-mono text-[11.5px] text-cream shadow-[0_10px_20px_-10px_rgb(0_0_0/0.5)] md:-right-5" style={{ "--r": "6deg" } as React.CSSProperties}>
                  <Instagram size={14} /> @threadsware
                </span>
              )}
            </DealIn>
          ))}
        </ul>
      </div>
    </section>
  );
}
