import Image from "next/image";
import { Reveal, LineReveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";
import { IMG } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Our Story", description: "From a single heavyweight T-shirt in a Mumbai apartment to a considered menswear wardrobe — the story of Threads Ware.", path: "/our-story", image: IMG.tailoring });

const TIMELINE = [
  ["2021", "The first tee", "Frustrated by T-shirts that lost their shape after three washes, our founder spent eleven months developing a single 240 GSM heavyweight tee with a family workshop in Tiruppur. The Mercer was born."],
  ["2022", "The oxford & the polo", "The Kensington Oxford and the Regent Knitted Polo followed — two pieces that still account for a third of what we sell."],
  ["2023", "A studio in Mumbai", "We opened our design studio and packing room in Lower Parel. Every order is still packed by hand there today."],
  ["2024", "Tailoring", "Our first half-canvassed blazer, made with a third-generation tailoring house in Chennai."],
  ["2025", "Leather & suede", "Partnering with a Chennai tannery, we introduced outerwear — and the Mayfair Suede Jacket."],
  ["2026", "The new standard", "Autumn/Winter ’26 — our most complete collection yet, and the opening of our first permanent store in Mumbai, coming soon."],
];

export default function OurStoryPage() {
  return (
    <>
      <section className="relative -mt-[var(--hdr)] flex h-[85svh] min-h-[540px] items-end overflow-hidden bg-night text-ivory">
        <Image src={IMG.tailoring} alt="" fill priority sizes="100vw" className="ken-burns img-grade object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/85 to-night/25" />
        <div className="container-site relative pb-20">
          <p className="eyebrow text-champagne-soft">Our Story</p>
          <h1 className="display-xl mt-6 max-w-5xl">
            <LineReveal lines={["It started with", "a single T-shirt."]} />
          </h1>
        </div>
      </section>

      <section className="container-site section-y">
        <Reveal className="mx-auto max-w-[var(--container-prose)] space-y-6 text-[17px] leading-[1.85] text-charcoal">
          <p className="font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] leading-snug text-ink">We didn’t set out to build a fashion brand. We set out to make one T-shirt properly.</p>
          <p>In 2021, our founder Aarav Mehta was tired of buying menswear that looked good on the hanger and tired after a month. Collars curled. Seams twisted. Prices climbed while quality quietly fell.</p>
          <p>So he went to Tiruppur, sat with a family that had been knitting cotton for three generations, and spent eleven months on a single heavyweight tee. Forty samples. Six fabric weights. One shoulder seam moved by eight millimetres.</p>
          <p>That obsession is still how we work. Every Threads Ware piece is designed in Mumbai, made by partners we know by name, and released only when it’s right.</p>
        </Reveal>
      </section>

      <section className="border-y border-line bg-paper section-y" aria-label="Timeline">
        <div className="container-site">
          <h2 className="display-md mb-14">The journey so far</h2>
          <ol className="grid gap-px bg-line md:grid-cols-3">
            {TIMELINE.map(([y, t, d], i) => (
              <Reveal as="li" key={y} delay={(i % 3) * 90} className="bg-paper p-8 md:p-10">
                <p className="font-serif text-[52px] leading-none text-champagne">{y}</p>
                <h3 className="mt-5 font-serif text-[24px]">{t}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">{d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-site grid items-center gap-12 section-y md:grid-cols-2">
        <Reveal variant="image" className="relative aspect-[4/5]">
          <Image src={IMG.teeBlackHanger} alt="The Mercer Heavyweight Tee" fill sizes="(max-width:768px) 100vw, 50vw" className="img-grade object-cover" />
        </Reveal>
        <Reveal>
          <p className="eyebrow text-muted">Where it began</p>
          <h2 className="display-md mt-5">The Mercer Heavyweight Tee</h2>
          <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-charcoal">Still made in the same Tiruppur workshop, still 240 GSM, still the piece we’re proudest of. Rated 4.8 by more than a hundred customers.</p>
          <div className="mt-8">
            <CTA href="/products/mercer-heavyweight-tee">Shop the Mercer</CTA>
          </div>
        </Reveal>
      </section>
    </>
  );
}
