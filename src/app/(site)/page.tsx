import Link from "next/link";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TrustBar } from "@/components/home/TrustBar";
import { Spotlight } from "@/components/home/Spotlight";
import { WelcomeBlock } from "@/components/home/WelcomeBlock";
import { LookCircles } from "@/components/home/LookCircles";
import { LookBuilder } from "@/components/home/LookBuilder";
import { Testimonials } from "@/components/home/Testimonials";
import { MakersStrip } from "@/components/home/MakersStrip";
import { DeliveryMap } from "@/components/home/DeliveryMap";
import { InTheWild } from "@/components/home/InTheWild";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArrowRight } from "@/components/ui/Icons";
import { bestSellers, newArrivals, products } from "@/data/products";
import { pageMeta } from "@/lib/seo";
import { home } from "@/lib/content";
import { syncCatalog } from "@/lib/server/store";

export const metadata = pageMeta({
  title: "Premium Shirts, T-Shirts & Tailoring",
  description: "Threads Wear — premium menswear designed in Mumbai. Heavyweight T-shirts, oxford and linen shirts, knitwear, outerwear and designer tailoring. Free shipping above ₹2,999, 15-day returns.",
  path: "/",
});

/** Lettered-size pieces in the given categories, best-reviewed first — the builder's three rails. */
const layer = (cats: string[]) => products.filter((p) => cats.includes(p.category) && p.sizes.includes("M")).sort((a, b) => b.reviewCount - a.reviewCount).map((p) => p.id);

/**
 * Homepage, same story as before in a bolder storefront UI: brand-colour hero slider, trust bar, the shelf as a
 * card carousel, the oxblood story block, looks, the outfit builder, new arrivals, notes, makers, delivery and snapshots.
 */
export default async function HomePage() {
  await syncCatalog();
  return (
    <>
      <HeroBanner />
      <TrustBar />

      {/* The shelf */}
      <section aria-labelledby="shelf-title" className="relative overflow-x-clip py-20 md:py-24">
        <div className="container-site">
          <SectionTitle id="shelf-title" title={home.shelf.title} accent={home.shelf.accent} sub={home.shelf.sub} />
          <Spotlight ids={bestSellers().slice(0, 7).map((p) => p.id)} />
        </div>
      </section>

      <WelcomeBlock />
      <LookCircles />
      <LookBuilder outer={layer(["jackets", "coats"])} mid={layer(["shirts", "knitwear", "polos", "sweatshirts-hoodies"])} base={layer(["t-shirts"])} />

      {/* New this season */}
      <section aria-labelledby="na-title" className="border-t border-line py-20 md:py-28">
        <div className="container-site">
          <SectionTitle id="na-title" title={home.fresh.title} accent={home.fresh.accent} sub={home.fresh.sub} />
          <ProductGrid products={newArrivals().slice(0, 4)} />
          <Reveal className="mt-10 text-center">
            <Link href="/new-arrivals" className="btn btn-dark btn-sm">
              View all new arrivals <ArrowRight size={13} className="btn-arrow" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Testimonials />
      <MakersStrip />
      <DeliveryMap />
      <InTheWild />
    </>
  );
}
