"use client";

import { useState } from "react";
import { useStore } from "@/components/providers/StoreProvider";
import { HeartIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { burst } from "@/lib/fly";

export function WishlistButton({ productId, name, className, size = 18, variant = "icon" }: { productId: string; name: string; className?: string; size?: number; variant?: "icon" | "button" }) {
  const { isWishlisted, toggleWishlist, hydrated } = useStore();
  const [pop, setPop] = useState(0);
  const active = hydrated && isWishlisted(productId);
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(productId);
    if (added) burst(e.currentTarget);
    setPop((p) => p + 1);
  };
  if (variant === "button")
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={cn("btn btn-outline btn-block", className)}>
        <HeartIcon key={pop} size={16} filled={active} className={pop ? "heart-pop" : undefined} />
        <span>{active ? "Saved to Wishlist" : "Add to Wishlist"}</span>
      </button>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={cn("grid place-items-center transition-opacity hover:opacity-70", className)}
    >
      <HeartIcon key={pop} size={size} filled={active} className={pop ? "heart-pop" : undefined} />
    </button>
  );
}
