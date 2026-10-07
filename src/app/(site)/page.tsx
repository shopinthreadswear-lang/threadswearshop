import Image from "next/image";
import Link from "next/link";
import { HeroCollage } from "@/components/home/HeroCollage";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/CTA";
import { Eyebrow } from "@/components/motion/Eyebrow";
import { bestSellers, newArrivals, products } from "@/data/products";
import { WARDROBE } from "@/data/story";
import { IMG } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Premium Shirts, T-Shirts & Tailoring",
  description: "Threads Ware — premium menswear designed in Mumbai. Heavyweight T-shirts, oxford and linen shirts, knitwear, outerwear and designer tailoring. Free shipping above ₹2,999, 15-day returns.",
  path: "/",
});

const PROMISE = [
  ["Complimentary shipping", "On every order above ₹2,999"],
  ["15-day returns", "Free pickup and exchanges"],
  ["Secure checkout", "UPI, cards, net banking and COD"],
  ["Checked by hand", "A 21-point inspection on every piece"],
];

/**
 * A deliberately quiet homepage — six sections, one job each:
 * hero → categories → new arrivals → one editorial feature → best sellers → our promise.
 */
export default function HomePage() {
  const count = (cats: string[]) => products.filter((p) => cats.includes(p.category)).length;
  return (
    <>
      <HeroCollage />

      {/* Categories */}
      <section aria-labelledby="cat-title" className="section-y">
        <div className="container-site">
          <SectionHeading eyebrow="Shop by Category" title={<span id="cat-title">What we make</span>} action={<TextLink href="/men/clothing">All Clothing</TextLink>} />
          <ul className="no-scrollbar -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory scroll-px-[var(--spacing-gutter)] gap-4 overflow-x-auto px-[var(--spacing-gutter)] md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
            {WARDROBE.map((w, i) => (
              <Reveal as="li" key={w.id} delay={i * 60} className="w-[60vw] max-w-[260px] shrink-0 snap-start md:w-auto md:max-w-none">
                <Link href={w.href} className="group block" data-cursor="View">
                  <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                    <Image src={w.image} alt={w.name} fill sizes="(max-width:768px) 60vw, 20vw" className="img-grade object-cover transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <h3 className="font-serif text-[22px] leading-tight">{w.name}</h3>
                    <span className="text-[12px] text-faint">{count(w.categories)}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* New arrivals */}
      <section aria-labelledby="na-title" className="border-t border-line section-y">
        <div className="container-site">
          <SectionHeading eyebrow="Autumn / Winter ’26" title={<span id="na-title">New Arrivals</span>} action={<TextLink href="/new-arrivals">View all</TextLink>} />
          <ProductGrid products={newArrivals().slice(0, 4)} />
        </div>
      </section>

      {/* One editorial feature */}
      <section aria-labelledby="sig-title" className="border-t border-line section-y">
        <div className="container-site grid items-center gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          <Reveal variant="image" className="relative aspect-[4/5] overflow-hidden bg-bone">
            <Image src={IMG.manSuedeStreet} alt="The Mayfair Suede Jacket from the Signature Collection" fill sizes="(max-width:768px) 100vw, 50vw" className="img-grade object-cover" />
          </Reveal>
          <Reveal className="max-w-md">
            <Eyebrow>The Signature Collection</Eyebrow>
            <h2 id="sig-title" className="display-md mt-5">Modern tailoring, made to last.</h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-muted">Goat suede, half-canvassed blazers and oxford shirts with a collar that holds its line — made in small runs.</p>
            <Link href="/collections/signature" className="btn btn-outline mt-9">
              Explore the Collection
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Best sellers */}
      <section aria-labelledby="bs-title" className="border-t border-line section-y">
        <div className="container-site">
          <SectionHeading eyebrow="Most Wanted" title={<span id="bs-title">Best Sellers</span>} action={<TextLink href="/best-sellers">View all</TextLink>} />
          <ProductGrid products={bestSellers().slice(0, 4)} />
        </div>
      </section>

      {/* Our promise */}
      <section aria-label="Our promise" className="border-t border-line">
        <ul className="container-site grid grid-cols-2 gap-y-10 py-14 md:grid-cols-4 md:py-16">
          {PROMISE.map(([t, d]) => (
            <li key={t} className="pr-6">
              <p className="text-[13px] font-semibold tracking-wide">{t}</p>
              <p className="mt-1.5 text-[13px] text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
