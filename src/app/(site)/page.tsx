import { Eyebrow } from "@/components/motion/Eyebrow";
import Image from "next/image";
import Link from "next/link";
import { HeroCollage } from "@/components/home/HeroCollage";
import { WardrobeIndex } from "@/components/home/WardrobeIndex";
import { ShirtAnatomy } from "@/components/home/ShirtAnatomy";
import { MostWanted } from "@/components/home/MostWanted";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { CollectionStories } from "@/components/home/CollectionStories";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { WhyEvidence } from "@/components/home/WhyEvidence";
import { StoryTestimonials } from "@/components/home/StoryTestimonials";
import { FinalCTA } from "@/components/home/FinalCTA";
import { SectionIndex } from "@/components/motion/SectionIndex";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CTA, TextLink } from "@/components/ui/CTA";
import { JournalCard } from "@/components/editorial/JournalCard";
import { Instagram } from "@/components/ui/Icons";
import { bestSellers, byCollection, newArrivals, trending } from "@/data/products";
import { articles } from "@/data/journal";
import { IMG } from "@/data/images";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Premium Shirts, T-Shirts & Tailoring",
  description: "Threads Ware — premium menswear topwear designed in Mumbai. Heavyweight T-shirts, oxford and linen shirts, knitwear, outerwear and designer tailoring. Free shipping above ₹2,999, 15-day returns.",
  path: "/",
});

const UGC = [
  { img: IMG.manCasualSeated, handle: "@kabir.wears" },
  { img: IMG.manDenimJacket, handle: "@rohan_in_mumbai" },
  { img: IMG.manWindow, handle: "@arnavk" },
  { img: IMG.manStripedOverDenim, handle: "@thedapperdesi" },
  { img: IMG.manHat, handle: "@nikhil.j" },
  { img: IMG.manBeanieScarf, handle: "@sid.travels" },
];

/**
 * The homepage is one story:
 * promise → proof → what's new → what we make → what it's made of → signature → most wanted →
 * how it's made → collections → a complete look → why → what customers say → reading → community → start.
 */
export default function HomePage() {
  const ids = (list: { id: string }[]) => list.map((p) => p.id);
  return (
    <>
      <SectionIndex />
      <HeroCollage />

      <section id="new" aria-labelledby="na" className="section-y">
        <div className="container-site">
          <SectionHeading eyebrow="Just Landed · Autumn / Winter ’26" title={<span id="na">New Arrivals</span>} intro="Deeper tones, heavier cloths and softer structure — the first pieces of the new season." action={<TextLink href="/new-arrivals">View New Arrivals</TextLink>} />
          <ProductCarousel ids={ids(newArrivals().slice(0, 10))} label="New arrivals" />
        </div>
      </section>

      <WardrobeIndex />
      <ShirtAnatomy />

      {/* Signature collection split */}
      <section id="signature" data-tone="dark" aria-labelledby="sig" className="bg-night text-ivory on-dark">
        <div className="grid lg:grid-cols-2">
          <Reveal variant="image" className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[100svh]">
            <Image src={IMG.manSuedeStreet} alt="The Mayfair Suede Jacket from the Signature Collection" fill sizes="(max-width:1024px) 100vw, 50vw" className="img-grade object-cover" />
          </Reveal>
          <div className="flex flex-col justify-center px-[var(--spacing-gutter)] py-20 lg:px-20 xl:px-28">
            <Reveal>
              <Eyebrow light>The Campaign</Eyebrow>
              <h2 id="sig" className="display-lg mt-6 max-w-[12ch]">The Threads Ware Signature Collection</h2>
              <p className="mt-7 max-w-md text-[16px] leading-relaxed text-ivory/70">Modern tailoring meets effortless everyday luxury. Goat suede tanned in Chennai, a half-canvassed blazer with a soft shoulder and an oxford shirt with a collar that holds its line — made in limited runs.</p>
              <div className="mt-10">
                <CTA href="/collections/signature" variant="light">
                  Explore the Collection
                </CTA>
              </div>
            </Reveal>
            <Reveal delay={150} className="mt-16 grid grid-cols-3 gap-3">
              {byCollection("signature")
                .slice(0, 3)
                .map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
                      <Image src={p.images[0]} alt={p.name} fill sizes="15vw" className="img-grade object-cover transition-transform duration-1000 group-hover:scale-105" />
                    </div>
                    <p className="mt-2 truncate text-[12px] text-ivory/70">{p.name.replace("The ", "")}</p>
                  </Link>
                ))}
            </Reveal>
          </div>
        </div>
      </section>

      <MostWanted
        tabs={[
          { id: "best", label: "Best Sellers", href: "/best-sellers", ids: ids(bestSellers().slice(0, 10)) },
          { id: "trending", label: "Trending", href: "/trending", ids: ids(trending().slice(0, 10)) },
        ]}
      />

      <ProcessTimeline />
      <CollectionStories />

      <div id="look" className="bg-paper">
        <ShopTheLook />
      </div>

      <WhyEvidence />
      <StoryTestimonials />

      {/* Journal */}
      <section id="journal" aria-labelledby="jr" className="border-t border-line section-y">
        <div className="container-site">
          <SectionHeading eyebrow="The Journal" title={<span id="jr">Style, considered.</span>} action={<TextLink href="/journal">Read the Journal</TextLink>} />
          <div className="no-scrollbar -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--spacing-gutter)] scroll-px-[var(--spacing-gutter)] md:mx-0 md:grid md:grid-cols-2 md:gap-10 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-6">
            {articles.slice(0, 4).map((a, i) => (
              <Reveal key={a.slug} delay={i * 80} className="w-[78vw] max-w-[340px] shrink-0 snap-start md:w-auto md:max-w-none">
                <JournalCard article={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* UGC */}
      <section id="community" aria-labelledby="ugc" className="pb-[var(--spacing-section)]">
        <div className="container-site">
          <SectionHeading align="center" eyebrow="#ThreadsWare" title={<span id="ugc">Worn by You</span>} intro="Tag @threadsware to be featured. Real customers, real wardrobes." />
        </div>
        <ul className="grid grid-cols-2 gap-1 md:grid-cols-6">
          {UGC.map((u, i) => (
            <Reveal as="li" key={u.handle} delay={i * 70}>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden bg-bone" aria-label={`View ${u.handle} on Instagram`}>
                <Image src={u.img} alt={`${u.handle} wearing Threads Ware`} fill sizes="(max-width:768px) 50vw, 17vw" className="img-grade object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                <div className="absolute inset-0 flex items-end justify-between bg-night/0 p-3 text-ivory opacity-0 transition-all duration-500 group-hover:bg-night/35 group-hover:opacity-100">
                  <span className="text-[12px]">{u.handle}</span>
                  <Instagram size={16} />
                </div>
              </a>
            </Reveal>
          ))}
        </ul>
      </section>

      <FinalCTA />
    </>
  );
}
