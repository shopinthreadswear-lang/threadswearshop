import { ListingPage } from "@/components/listing/ListingPage";
import { products } from "@/data/products";
import { IMG } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Shop All Topwear", description: "Shop every Threads Ware piece — heavyweight tees, oxford shirts, polos, knitwear, outerwear and designer tailoring. Complimentary shipping above ₹2,999.", path: "/shop" });

export default function ShopPage() {
  return (
    <ListingPage
      eyebrow="Shop All"
      title="Everything, considered."
      description="Every Threads Ware piece in one place — from the heavyweight tee to the double-breasted blazer. Designed with intention. Worn without effort."
      image={IMG.rackNeutral}
      crumbs={[{ label: "Shop All" }]}
      products={products}
      listName="Shop All"
      path="/shop"
      facets={["category", "type", "size", "color", "fit", "price", "material", "sleeve", "pattern", "occasion", "collection", "discount", "availability"]}
    />
  );
}
