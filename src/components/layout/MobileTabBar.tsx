"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BagIcon, HeartIcon, Home, SearchIcon, UserIcon } from "@/components/ui/Icons";
import { useStore } from "@/components/providers/StoreProvider";
import { cn } from "@/lib/cn";

export function MobileTabBar() {
  const pathname = usePathname();
  const { setSearchOpen, setCartOpen, cartCount, wishlist, hydrated, user } = useStore();
  if (pathname.startsWith("/products/")) return null; // PDP shows a sticky Add to Bag instead
  const item = "relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em]";
  const badge = (n: number) => hydrated && n > 0 && <span className="absolute right-[calc(50%-18px)] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] text-ivory">{n}</span>;
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/[0.97] pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="flex h-[58px]">
        <Link href="/" className={cn(item, pathname === "/" ? "text-ink" : "text-muted")} aria-current={pathname === "/" ? "page" : undefined}>
          <Home size={19} />
          Home
        </Link>
        <button type="button" className={cn(item, "text-muted")} onClick={() => setSearchOpen(true)}>
          <SearchIcon size={19} />
          Search
        </button>
        <Link href="/wishlist" className={cn(item, pathname === "/wishlist" ? "text-ink" : "text-muted")}>
          <HeartIcon size={19} />
          Wishlist
          {badge(wishlist.length)}
        </Link>
        <button type="button" className={cn(item, "text-muted")} onClick={() => setCartOpen(true)}>
          <BagIcon size={19} />
          Bag
          {badge(cartCount)}
        </button>
        <Link href={user ? "/account" : "/account/login"} className={cn(item, pathname.startsWith("/account") ? "text-ink" : "text-muted")}>
          <UserIcon size={19} />
          Account
        </Link>
      </div>
    </nav>
  );
}
