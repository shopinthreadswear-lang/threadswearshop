import { ListingPage } from "@/components/listing/ListingPage";
import { onSale } from "@/data/products";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Sale — Final Pieces", description: "Final pieces from previous seasons at reduced prices. Limited sizes, same Threads Wear quality.", path: "/sale" });

export default function SalePage() {
  return (
    <ListingPage
      eyebrow="Final Pieces"
      title="The Archive Sale"
      description="A small selection of pieces from previous seasons, in limited sizes. Same fabrics, same finishing — at a considered reduction. Sale items are eligible for exchange only."
      crumbs={[{ label: "Sale" }]}
      products={onSale()}
      listName="Sale"
      path="/sale"
      facets={["category", "size", "color", "price", "discount", "availability"]}
    />
  );
}
