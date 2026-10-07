import { Eyebrow } from "@/components/motion/Eyebrow";
import { EVIDENCE } from "@/data/story";
import { WordReveal } from "@/components/motion/WordReveal";
import { Reveal } from "@/components/ui/Reveal";
import { StatCounter } from "@/components/motion/StatCounter";

/** 07 — Why us, as claims with numbers attached. Editorial rows rather than an icon grid. */
export function WhyEvidence() {
  return (
    <section id="why" data-section="Why us" aria-labelledby="why-title" className="border-t border-line bg-paper section-y">
      <div className="container-site">
        <div className="mb-14 grid gap-6 md:mb-20 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow>Why Threads Ware</Eyebrow>
            <WordReveal id="why-title" text="Worth it — and here’s the evidence." className="display-lg mt-5" />
          </div>
          <p className="max-w-md text-[15.5px] leading-relaxed text-muted md:col-span-5">“Premium” is easy to say. These are the specific things we do differently, and how you can check them.</p>
        </div>
        <ol className="border-t border-ink">
          {EVIDENCE.map((e, i) => (
            <Reveal as="li" key={e.title} delay={i * 60} className="group grid gap-4 border-b border-line py-8 md:grid-cols-12 md:items-baseline md:gap-8 md:py-10">
              <span className="text-[12px] tabular-nums text-faint md:col-span-1">0{i + 1}</span>
              <h3 className="font-serif text-[clamp(1.6rem,2.6vw,2.3rem)] leading-tight md:col-span-4">{e.title}</h3>
              <p className="max-w-xl text-[15px] leading-relaxed text-charcoal md:col-span-5">{e.text}</p>
              <p className="md:col-span-2 md:text-right">
                <StatCounter value={Number(e.metric)} className="font-serif text-[clamp(2.4rem,4vw,3.6rem)] leading-none transition-colors duration-500 group-hover:text-champagne" />
                <span className="ml-1.5 text-[11px] uppercase tracking-[0.14em] text-muted">{e.unit}</span>
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
