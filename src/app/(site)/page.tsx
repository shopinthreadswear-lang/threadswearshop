import Link from "next/link";
import { HeroBanner } from "@/components/home/HeroBanner";
import { Ticker } from "@/components/home/Ticker";
import { Spotlight } from "@/components/home/Spotlight";
import { WelcomeBlock } from "@/components/home/WelcomeBlock";
import { LookCircles } from "@/components/home/LookCircles";
import { Testimonials } from "@/components/home/Testimonials";
import { MakersStrip } from "@/components/home/MakersStrip";
import { DeliveryMap } from "@/components/home/DeliveryMap";
import { InTheWild } from "@/components/home/InTheWild";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { Doodle } from "@/components/doodles/Doodle";
import { bestSellers, newArrivals } from "@/data/products";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Premium Shirts, T-Shirts & Tailoring",
  description: "Threads Ware — premium menswear designed in Mumbai. Heavyweight T-shirts, oxford and linen shirts, knitwear, outerwear and designer tailoring. Free shipping above ₹2,999, 15-day returns.",
  path: "/",
});

/**
 * Homepage, laid out like a well-loved shop: a cover photo, a ribbon of promises, one shelf, colour blocks
 * for the story and delivery, outfits, customer notes, and snapshots — with pen doodles in the margins.
 */
export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <Ticker />

      {/* The shelf */}
      <section aria-labelledby="shelf-title" className="relative overflow-x-clip py-20 md:py-28">
        <div className="container-site">
          <Reveal className="relative mx-auto mb-10 max-w-2xl text-center md:mb-14">
            <h2 id="shelf-title" className="display-md text-burgundy">
              Not-so-ordinary shirts, tees <br className="hidden sm:block" />
              and <em className="italic">everyday tailoring</em>
            </h2>
            <Doodle name="sparkle" className="absolute -right-2 -top-6 hidden w-10 text-ochre sm:block" strokeWidth={2} />
          </Reveal>
          <Spotlight ids={bestSellers().slice(0, 7).map((p) => p.id)} />
        </div>
      </section>

      <WelcomeBlock />
      <LookCircles />

      {/* New this season */}
      <section aria-labelledby="na-title" className="border-t border-line py-20 md:py-28">
        <div className="container-site">
          <Reveal className="mb-10 flex flex-col items-center gap-5 text-center md:mb-14">
            <h2 id="na-title" className="display-md text-burgundy">
              Fresh off the <em className="italic">cutting table</em>
            </h2>
            <Link href="/new-arrivals" className="btn btn-outline btn-sm">
              All new arrivals
            </Link>
          </Reveal>
          <ProductGrid products={newArrivals().slice(0, 4)} />
        </div>
      </section>

      <Testimonials />
      <MakersStrip />
      <DeliveryMap />
      <InTheWild />
    </>
  );
}
