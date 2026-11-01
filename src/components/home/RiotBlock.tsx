import Image from "next/image";
import Link from "next/link";
import { SpringHeading } from "@/components/motion/Scroll";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import { IMG } from "@/data/images";

/** Olive colour block: a stacked poster headline on the left, a three-photo mosaic on the right. */
export function RiotBlock() {
  return (
    <section aria-labelledby="riot-title" className="overflow-hidden bg-olive text-ink">
      <div className="grid md:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center px-[var(--spacing-gutter)] py-20 md:py-24 md:pr-12">
          <SpringHeading
            id="riot-title"
            className="font-serif text-[clamp(3rem,6.4vw,6.4rem)] font-extrabold leading-[0.86] tracking-[-0.025em] [font-variation-settings:'wdth'_75,'opsz'_96]"
            parts={["See How We Turn Cloth Into", { em: "Statements—", className: "not-italic underline decoration-[0.06em] underline-offset-[0.08em]" }]}
          />
          <Reveal delay={120}>
            <p className="mt-8 max-w-md text-[14.5px] leading-[1.75] text-ink/85">
              Every piece starts on a cutting table in our Mumbai studio: 240 GSM jersey that holds its shape, two-ply oxford with a collar that stands up for itself, and half-canvassed blazers that mould to you with wear. Small runs, loud details, no filler.
            </p>
            <Link href="/our-story" className="btn btn-primary btn-sm mt-9">
              How we make it <ArrowRight size={14} className="btn-arrow" />
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-1.5 p-1.5 md:min-h-[680px] md:pl-0">
          <div className="relative row-span-2 min-h-[300px] overflow-hidden">
            <Image src={IMG.manStripedOverDenim} alt="Man in a denim overshirt over a striped tee" fill sizes="(max-width:768px) 50vw, 27vw" className="object-cover object-[50%_25%] transition-transform duration-[1200ms] ease-[var(--ease-lux)] hover:scale-105" />
          </div>
          <div className="relative aspect-square overflow-hidden md:aspect-auto">
            <Image src={IMG.coatWalk} alt="Man walking in a camel overcoat" fill sizes="(max-width:768px) 50vw, 27vw" className="object-cover object-[50%_30%] transition-transform duration-[1200ms] ease-[var(--ease-lux)] hover:scale-105" />
          </div>
          <div className="relative aspect-square overflow-hidden md:aspect-auto">
            <Image src={IMG.teeGraphicModel} alt="Man in a graphic print tee" fill sizes="(max-width:768px) 50vw, 27vw" className="object-cover object-[50%_25%] transition-transform duration-[1200ms] ease-[var(--ease-lux)] hover:scale-105" />
          </div>
        </div>
      </div>
    </section>
  );
}
