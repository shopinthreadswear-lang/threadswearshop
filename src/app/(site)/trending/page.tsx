import { ListingPage } from "@/components/listing/ListingPage";
import { trending } from "@/data/products";
import { IMG } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Trending Now", description: "What's trending at Threads Wear this week — the pieces our community is adding to their wardrobes right now.", path: "/trending" });

export default function TrendingPage() {
  return (
    <ListingPage
      eyebrow="This Week"
      title="Trending Now"
      description="What our community is reaching for right now — updated weekly from what's being saved, shared and worn."
      image={IMG.manDenimJacket}
      crumbs={[{ label: "Trending" }]}
      products={trending()}
      listName="Trending"
      path="/trending"
      facets={["category", "type", "size", "color", "price", "availability"]}
    />
  );
}
