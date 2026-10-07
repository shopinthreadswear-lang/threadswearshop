import { ListingPage } from "@/components/listing/ListingPage";
import { bestSellers } from "@/data/products";
import { IMG } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Best Sellers", description: "Our most-loved menswear — the Mercer Heavyweight Tee, Kensington Oxford Shirt, Regent Knitted Polo and more. Rated 4.8/5 by our customers.", path: "/best-sellers" });

export default function BestSellersPage() {
  return (
    <ListingPage
      eyebrow="Most Wanted"
      title="Best Sellers"
      description="The pieces our customers return to season after season — proven in fit, fabric and longevity."
      image={IMG.teeBlackModel2}
      crumbs={[{ label: "Best Sellers" }]}
      products={bestSellers()}
      listName="Best Sellers"
      path="/best-sellers"
      defaultSort="best-selling"
      facets={["category", "type", "size", "color", "fit", "price", "availability"]}
    />
  );
}
