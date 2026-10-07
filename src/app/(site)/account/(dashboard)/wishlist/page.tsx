import { WishlistGrid } from "@/components/account/WishlistGrid";

export const metadata = { title: "My Wishlist", robots: { index: false } };

export default function AccountWishlist() {
  return (
    <>
      <h1 className="display-md">Wishlist</h1>
      <p className="mb-10 mt-3 text-[14px] text-muted">Saved to your account and synced across devices.</p>
      <WishlistGrid compact />
    </>
  );
}
