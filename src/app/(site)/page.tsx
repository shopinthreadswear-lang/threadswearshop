import { HeroSlider } from "@/components/home/HeroSlider";
import { NewArrivals } from "@/components/home/NewArrivals";
import { PromoMosaic } from "@/components/home/PromoMosaic";
import { LookBuilder } from "@/components/home/LookBuilder";
import { ProductGrid } from "@/components/product/ProductGrid";
import { TextLink } from "@/components/ui/CTA";
import { Check, Lock, ReturnIcon, Truck } from "@/components/ui/Icons";
import { bestSellers, newArrivals, onSale, products } from "@/data/products";
import { WARDROBE } from "@/data/story";
import { IMG } from "@/data/images";
import { commerce, formatINR } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Premium Shirts, T-Shirts & Tailoring",
  description: "Threads Wear — premium menswear designed in Mumbai. Heavyweight T-shirts, oxford and linen shirts, knitwear, outerwear and designer tailoring. Free shipping above ₹2,999, 15-day returns.",
  path: "/",
});

/** Lettered-size pieces in the given categories, best-reviewed first — the builder's three rails. */
const layer = (cats: string[]) => products.filter((p) => cats.includes(p.category) && p.sizes.includes("M")).sort((a, b) => b.reviewCount - a.reviewCount).map((p) => p.id);

/** Newest first within a category, so each tab leads with what's just landed. */
const newestIn = (cats: string[]) => products.filter((p) => cats.includes(p.category)).sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.createdAt.localeCompare(a.createdAt)).slice(0, 8).map((p) => p.id);

const SERVICE = [
  { icon: Truck, title: "Free shipping", text: `On orders above ${formatINR(commerce.freeShippingThreshold)}` },
  { icon: ReturnIcon, title: `${commerce.returnWindowDays}-day returns`, text: "Free pickup and exchanges" },
  { icon: Lock, title: "Secure checkout", text: "UPI, cards, net banking and COD" },
  { icon: Check, title: "Checked by hand", text: "Inspected before it ships" },
];

/** Storefront homepage: campaign slider → new arrivals by category → promo tiles → best sellers → outfit builder → service. */
export default function HomePage() {
  const maxDiscount = Math.max(...onSale().map((p) => p.discount ?? 0));
  const tabs = [{ id: "all", label: "All", ids: newArrivals().slice(0, 8).map((p) => p.id) }, ...WARDROBE.map((w) => ({ id: w.id, label: w.name, ids: newestIn(w.categories) }))];
  return (
    <>
      <HeroSlider />
      <NewArrivals tabs={tabs} />

      <PromoMosaic
        tiles={[
          { eyebrow: "Easy Layers", title: "Soft Structure for Every Day", href: "/men/sweatshirts-hoodies", img: IMG.sweatNavy, alt: "Man in a navy sweatshirt against a brick wall", focus: "50% 22%", imgBox: "inset-x-0 bottom-0 top-[30%] [mask-image:linear-gradient(to_bottom,transparent,#000_16%)]", className: "bg-mist" },
          { eyebrow: "Sharp Dressing", title: "Shirts With a Better Collar", href: "/men/shirts", img: IMG.shirtBlueModel, alt: "Man in a pale blue shirt and navy tie", focus: "50% 20%", imgBox: "inset-y-0 right-0 w-[56%]", className: "bg-bone" },
          { eyebrow: "The Essentials", title: "The Tee, Perfected", href: "/men/t-shirts", img: IMG.teeWhiteModel, alt: "Man in a white crew-neck tee", focus: "50% 20%", imgBox: "inset-y-0 left-0 w-[46%]", className: "bg-bone", align: "right" },
        ]}
        sale={{ percent: maxDiscount, href: "/sale" }}
      />

      <section aria-labelledby="bs-title" className="pb-16 md:pb-20">
        <div className="container-site">
          <div className="mb-7 flex items-baseline justify-between gap-4">
            <h2 id="bs-title" className="display-md">
              Best Sellers
            </h2>
            <TextLink href="/best-sellers">View all</TextLink>
          </div>
          <ProductGrid products={bestSellers().slice(0, 4)} />
        </div>
      </section>

      <LookBuilder outer={layer(["jackets", "coats"])} mid={layer(["shirts", "knitwear", "polos", "sweatshirts-hoodies"])} base={layer(["t-shirts"])} />

      <section aria-label="Why shop with us" className="border-t border-line">
        <ul className="container-site grid grid-cols-2 gap-x-4 gap-y-8 py-10 md:grid-cols-4 md:py-12">
          {SERVICE.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3.5">
              <Icon size={22} className="mt-0.5 shrink-0 text-denim" />
              <div>
                <p className="text-[14px] font-medium">{title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
