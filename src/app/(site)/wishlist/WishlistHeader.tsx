"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/StoreProvider";

export function WishlistHeader() {
  const { wishlist, hydrated, user } = useStore();
  return (
    <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="display-lg">Wishlist</h1>
        <p className="mt-3 text-[14px] text-muted">{hydrated && wishlist.length > 0 ? `${wishlist.length} ${wishlist.length === 1 ? "piece" : "pieces"} saved` : " "}</p>
      </div>
      {hydrated && !user && wishlist.length > 0 && (
        <p className="text-[13px] text-muted">
          <Link href="/account/login?next=/wishlist" className="link-static text-ink">
            Sign in
          </Link>{" "}
          to keep your wishlist across devices.
        </p>
      )}
    </div>
  );
}
