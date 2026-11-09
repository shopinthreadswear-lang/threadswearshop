import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Instagram } from "@/components/ui/Icons";
import { IMG } from "@/data/images";
import { site } from "@/lib/site";

const SHOTS = [
  { img: IMG.manDenimJacket, alt: "Man in a denim jacket on a rooftop", focus: "50% 30%" },
  { img: IMG.rackWarm, alt: "A rail of shirts and jackets in warm light", focus: "50% 50%" },
  { img: IMG.manRaglan, alt: "Man in a raglan tee sitting on a boardwalk", focus: "50% 40%" },
];

/** Customer and studio snapshots in a row of rounded tiles, with the Instagram handle. */
export function InTheWild() {
  return (
    <section aria-labelledby="wild-title" className="pb-24 pt-20 md:pb-28 md:pt-28">
      <div className="container-site">
        <SectionTitle id="wild-title" title="Threads Ware" accent="in the wild" sub={<a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="link-static hit">Tag @threadsware to be featured</a>} />
        <ul className="no-scrollbar -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--spacing-gutter)] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {SHOTS.map((s, i) => (
            <Reveal as="li" key={s.alt} delay={i * 110} className="w-[72vw] shrink-0 snap-center md:w-auto">
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${s.alt} — see more on Instagram`} className="lift group relative block aspect-square overflow-hidden rounded-card bg-bone">
                <Image src={s.img} alt="" fill sizes="(max-width:768px) 72vw, 33vw" className="object-cover" style={{ objectPosition: s.focus }} />
                <span className="absolute inset-0 grid place-items-center bg-burgundy/0 text-cream opacity-0 transition-[background-color,opacity] duration-500 group-hover:bg-burgundy/45 group-hover:opacity-100" aria-hidden>
                  <span className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-burgundy">
                    <Instagram size={14} /> @threadsware
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
