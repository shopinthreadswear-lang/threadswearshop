"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStore } from "@/components/providers/StoreProvider";

/** Closes transient overlays when the route changes. */
export function RouteEffects() {
  const pathname = usePathname();
  const { setCartOpen, setSearchOpen, closeSizeGuide } = useStore();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setCartOpen(false);
    setSearchOpen(false);
    closeSizeGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}
