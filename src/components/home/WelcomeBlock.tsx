import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Doodle } from "@/components/doodles/Doodle";
import { IMG } from "@/data/images";

/** Oxblood colour block: why we make what we make, pinned up like photos on a studio wall. */
export function WelcomeBlock() {
  return (
    <section aria-labelledby="welcome-title" className="relative overflow-hidden bg-burgundy text-cream">
      <div className="container-site grid gap-14 py-20 md:grid-cols-12 md:gap-8 md:py-28 lg:py-32">
        <div className="relative md:col-span-5">
          <Reveal>
            <h2 id="welcome-title" className="display-lg max-w-[11ch]">
              Dressed for every <em className="italic text-champagne-soft">table.</em>
            </h2>
          </Reveal>
          <Reveal delay={120} className="relative mt-12 hidden w-[62%] md:block">
            <div className="bob relative aspect-square overflow-hidden rounded-[22px] border-[6px] border-cream shadow-[0_24px_40px_-24px_rgb(0_0_0/0.6)]" style={{ "--r": "-5deg" } as React.CSSProperties}>
              <Image src={IMG.manWindow} alt="Man sitting in a circular window in a field jacket" fill sizes="22vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal className="absolute -bottom-6 right-4 hidden w-28 text-champagne-soft md:block lg:w-36">
            <Doodle name="needle" draw strokeWidth={1.8} delay={300} />
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] rotate-[2.5deg] overflow-hidden rounded-[22px] border-[6px] border-cream shadow-[0_30px_50px_-30px_rgb(0_0_0/0.65)] md:max-w-[460px]">
              <Image src={IMG.manCasualSeated} alt="Man in a camel blazer and white tee seated on a stool" fill sizes="(max-width:768px) 90vw, 460px" className="object-cover object-[50%_30%]" />
            </div>
          </Reveal>
          <Reveal className="pointer-events-none absolute right-[3%] top-[22%] hidden w-32 text-cream lg:block xl:w-40">
            <Doodle name="hanger" draw strokeWidth={1.8} delay={200} />
          </Reveal>
          <Reveal delay={150} className="mt-12 max-w-md">
            <p className="font-mono text-[13px] leading-[1.8] text-cream/90">
              We make clothes for the moments that bring people together — long Sunday lunches, loud weddings, early Mondays and everything in between. Shirts, tees and tailoring that are easy to wear, cut with care and made to stay in your life for years.
            </p>
            <Link href="/our-story" className="btn btn-light btn-sm mt-8">
              Our story
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
