import { WishlistGrid } from "@/components/account/WishlistGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { WishlistHeader } from "./WishlistHeader";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

export const metadata = { title: "Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: "Wishlist" }]} className="mb-8" />
      <WishlistHeader />
      <WishlistGrid />
      <RecentlyViewed title="Recently Viewed" />
    </div>
  );
}
