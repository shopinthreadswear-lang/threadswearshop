import { ListingPage } from "@/components/listing/ListingPage";
import { newArrivals } from "@/data/products";
import { IMG } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "New Arrivals", description: "The latest Threads Ware menswear — new-season suede, linen, knitwear and tailoring. Shop new arrivals with complimentary shipping above ₹2,999.", path: "/new-arrivals" });

export default function NewArrivalsPage() {
  return (
    <ListingPage
      eyebrow="Autumn / Winter 2026"
      title="New Arrivals"
      description="Deeper tones, heavier cloths and softer structure. The newest pieces from our Mumbai studio, released in small runs."
      image={IMG.manBrownJacket}
      crumbs={[{ label: "New Arrivals" }]}
      products={newArrivals()}
      listName="New Arrivals"
      path="/new-arrivals"
      defaultSort="newest"
      facets={["category", "type", "size", "color", "fit", "price", "material", "occasion", "availability"]}
    />
  );
}
