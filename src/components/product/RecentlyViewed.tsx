"use client";

import { useStore } from "@/components/providers/StoreProvider";
import { getProductById } from "@/data/products";
import { ProductCarousel } from "./ProductCarousel";
import type { Product } from "@/lib/types";

export function RecentlyViewed({ excludeId, title = "Recently Viewed" }: { excludeId?: string; title?: string }) {
  const { recentlyViewed, hydrated } = useStore();
  if (!hydrated) return null;
  const list = recentlyViewed.filter((id) => id !== excludeId).map(getProductById).filter(Boolean) as Product[];
  if (list.length < 2) return null;
  return (
    <section aria-labelledby="rv-title" className="border-t border-line py-16 md:py-20">
      <h2 id="rv-title" className="display-sm mb-8">{title}</h2>
      <ProductCarousel ids={(list).map((p) => p.id)} label={title} />
    </section>
  );
}
