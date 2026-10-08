import Image from "next/image";
import Link from "next/link";
import { LineReveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import { IMG } from "@/data/images";

/** Full-bleed campaign photograph with one line of type set into its corner, as on a magazine cover. */
export function HeroBanner() {
  return (
    <section aria-labelledby="hero-title" className="relative -mt-[var(--hdr)] h-[92svh] min-h-[560px] overflow-hidden bg-night text-cream md:h-[100svh] md:max-h-[1040px] md:min-h-[640px]">
      <Image src={IMG.manHat} alt="Man in a black tee and hat against a terracotta wall" fill priority sizes="100vw" className="ken-burns object-cover object-[58%_30%]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1d0f0a]/75 via-[#1d0f0a]/10 to-[#1d0f0a]/35" />

      <div className="container-site relative flex h-full flex-col justify-end pb-12 md:pb-20">
        <h1 id="hero-title" className="max-w-[12ch] font-serif text-[clamp(2.9rem,7.4vw,7.4rem)] font-medium leading-[0.92] tracking-[-0.03em] [font-variation-settings:'SOFT'_100,'WONK'_1]">
          <LineReveal lines={["The shirt you’ll", <em key="i" className="italic">reach for first.</em>]} baseDelay={250} step={140} />
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animation: "fade-up 900ms var(--ease-lux) 650ms both" }}>
          <Link href="/new-arrivals" className="btn btn-light">
            Shop new arrivals <ArrowRight size={14} className="btn-arrow" />
          </Link>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-cream/85">Autumn / Winter ’26 · Designed in Mumbai</p>
        </div>
      </div>
    </section>
  );
}
