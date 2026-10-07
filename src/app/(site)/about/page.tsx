import Image from "next/image";
import { Reveal, LineReveal } from "@/components/ui/Reveal";
import { CTA, TextLink } from "@/components/ui/CTA";
import { IMG } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "About Threads Ware", description: "Threads Ware — for the modern man. Clean silhouettes, premium materials and pieces designed to move effortlessly between work, weekends and everything in between.", path: "/about", image: IMG.walkSuit });

const PILLARS = [
  { id: "philosophy", n: "01", title: "Our Philosophy", text: "Everyday menswear should feel considered. We design fewer pieces, better — and we make each one to be worn hard and kept for years.", image: IMG.walkSuit },
  { id: "craftsmanship", n: "02", title: "Craftsmanship", text: "We work with eleven family-run workshops in Tiruppur, Ludhiana and Chennai. Single-needle stitching, half-canvassed tailoring and hand-finished suede are standard, not special.", image: IMG.tailoring },
  { id: "materials", n: "03", title: "Materials", text: "Supima and Egyptian cottons, European flax, Biella wool-cashmere and Scottish lambswool. We buy small, traceable quantities from mills we have visited — and we make in small runs to avoid waste.", image: IMG.linenFabric },
  { id: "design", n: "04", title: "Design", text: "Every silhouette begins in our Mumbai studio, fitted on real bodies across six sizes. We obsess over proportion — the roll of a collar, the drop of a shoulder, the length of a sleeve.", image: IMG.shirtsCloseup },
  { id: "quality", n: "05", title: "Quality", text: "Each piece passes a 21-point inspection — seams, measurements, buttons, colour and finish — before it is folded, tissue-wrapped and boxed by hand.", image: IMG.knitHanging },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative -mt-[var(--hdr)] flex h-[92svh] min-h-[560px] items-end overflow-hidden bg-night text-ivory">
        <Image src={IMG.heroNavy} alt="" fill priority sizes="100vw" className="ken-burns img-grade object-cover object-[50%_30%] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-night/40" />
        <div className="container-site relative pb-20">
          <p className="eyebrow text-champagne-soft">About Us</p>
          <h1 className="display-xl mt-6">
            <LineReveal lines={["Threads Ware", <em key="e" className="font-serif italic">for the modern man.</em>]} />
          </h1>
        </div>
      </section>

      <section className="container-site section-y">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7 md:col-start-2">
            <p className="font-serif text-[clamp(1.7rem,3.2vw,2.8rem)] leading-[1.2]">Threads Ware was created around a simple belief — everyday menswear should feel considered.</p>
          </Reveal>
          <Reveal delay={150} className="space-y-5 text-[15.5px] leading-relaxed text-charcoal md:col-span-4 md:col-start-9 md:pt-3">
            <p>We focus on clean silhouettes, premium materials and pieces designed to move effortlessly between work, weekends and everything in between.</p>
            <p>No seasonal noise, no logos shouting for attention. Just clothes that fit beautifully, feel exceptional and get better the more you wear them.</p>
          </Reveal>
        </div>
      </section>

      {PILLARS.map((p, i) => (
        <section key={p.id} id={p.id} className="scroll-mt-24 border-t border-line">
          <div className="container-site grid items-center gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-24">
            <Reveal variant="image" className={`relative aspect-[4/5] ${i % 2 ? "md:order-2" : ""}`}>
              <Image src={p.image} alt={p.title} fill sizes="(max-width:768px) 100vw, 50vw" className="img-grade object-cover" />
            </Reveal>
            <Reveal className={i % 2 ? "md:order-1" : ""}>
              <p className="font-serif text-[60px] leading-none text-champagne">{p.n}</p>
              <h2 className="display-md mt-6">{p.title}</h2>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-charcoal">{p.text}</p>
            </Reveal>
          </div>
        </section>
      ))}

      <section className="on-dark bg-night text-ivory">
        <div className="container-site grid items-center gap-12 py-24 md:grid-cols-2 md:py-32">
          <Reveal>
            <p className="eyebrow text-champagne-soft">06 — The Threads Ware Man</p>
            <h2 className="display-lg mt-6">Confident, never loud.</h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ivory/70">He buys less and chooses better. He knows the difference between fashionable and well-made. He dresses for the room he’s walking into — the boardroom on Monday, a long lunch on Saturday, a wedding in December — and wants clothes that work as hard as he does.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <CTA href="/collections/signature" variant="light">Explore the Signature Collection</CTA>
            </div>
          </Reveal>
          <Reveal variant="image" className="relative aspect-[4/5]">
            <Image src={IMG.manPortraitKnit} alt="The Threads Ware man" fill sizes="(max-width:768px) 100vw, 50vw" className="img-grade object-cover" />
          </Reveal>
        </div>
      </section>

      <section className="container-site section-y text-center">
        <Reveal>
          <p className="display-md mx-auto max-w-2xl">Made to be worn. Designed to be remembered.</p>
          <div className="mt-8 flex justify-center gap-8">
            <TextLink href="/our-story">Read Our Story</TextLink>
            <TextLink href="/journal">The Journal</TextLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
