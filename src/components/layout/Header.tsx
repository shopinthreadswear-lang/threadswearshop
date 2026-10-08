"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AnnouncementBar } from "./AnnouncementBar";
import { MegaMenu, type MenuKey } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { MenuToggle } from "./MenuToggle";
import { Wordmark } from "@/components/ui/Logo";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/ui/Icons";
import { useStore } from "@/components/providers/StoreProvider";
import { cn } from "@/lib/cn";

const OVERLAY_ROUTES = ["/", "/about", "/our-story"];

const NAV: { label: string; href: string; menu?: MenuKey; wideOnly?: boolean }[] = [
  { label: "Shop", href: "/shop", menu: "shop" },
  { label: "New Arrivals", href: "/new-arrivals", wideOnly: true },
  { label: "Clothing", href: "/men/clothing", menu: "clothing" },
  { label: "Designer Wear", href: "/men/designer-wear" },
  { label: "Collections", href: "/collections", menu: "collections", wideOnly: true },
];

function Count({ n }: { n: number }) {
  const [bump, setBump] = useState(0);
  const prev = useRef(n);
  useEffect(() => {
    if (n > prev.current) setBump((b) => b + 1);
    prev.current = n;
  }, [n]);
  if (!n) return null;
  return (
    <span key={bump} className={cn("absolute -right-1.5 -top-1 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-current px-1", bump && "bump")}>
      <span className="text-[10px] font-semibold leading-none text-[color:var(--count-fg)]">{n}</span>
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const { cartCount, wishlist, hydrated, setCartOpen, setSearchOpen, user } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const overlay = OVERLAY_ROUTES.includes(pathname);
  const transparent = overlay && !scrolled && !menu;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus on navigation
    setMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  const openMenu = (k: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setMenu(k), menu ? 0 : 120);
  };
  const scheduleClose = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 180);
  };

  return (
    <>
      <div
        className={cn("fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-lux)]", scrolled && "-translate-y-9")}
        onMouseLeave={scheduleClose}
        style={{ "--count-fg": transparent ? "var(--color-wine)" : "var(--color-cream)" } as React.CSSProperties}
      >
        <AnnouncementBar />
        <header
          className={cn(
            "relative transition-[background-color,color,height,border-color,backdrop-filter] duration-500 ease-[var(--ease-lux)]",
            transparent ? "border-b border-transparent bg-transparent text-cream" : "border-b border-line bg-ivory/[0.96] text-ink backdrop-blur-md",
          )}
        >
          {transparent && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night/35 to-transparent" />}
          <div className={cn("container-site relative grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-500 ease-[var(--ease-lux)]", scrolled ? "h-[60px]" : "h-[64px] md:h-[78px]")}>
            {/* Left */}
            <div className="flex items-center gap-1">
              <MenuToggle open={mobileOpen} onClick={() => setMobileOpen(true)} className="-ml-2 lg:hidden" label="Open menu" />
              <button type="button" className="grid h-11 w-11 place-items-center lg:hidden" aria-label="Search" onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </button>
              <nav aria-label="Primary" className="hidden lg:block">
                <ul className="flex items-center gap-6 min-[1520px]:gap-7">
                  {NAV.map((n) => {
                    const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href + "/"));
                    return (
                      <li key={n.href} className={cn(n.wideOnly && "hidden min-[1520px]:block")} onMouseEnter={() => (n.menu ? openMenu(n.menu) : scheduleClose())}>
                        {n.menu ? (
                          <span className="flex items-center">
                            <Link href={n.href} aria-current={active ? "page" : undefined} className={cn("link-u whitespace-nowrap py-1 font-mono text-[11.5px] font-medium uppercase tracking-[0.1em]", menu === n.menu && "[background-size:100%_1px]")}>
                              {n.label}
                            </Link>
                            <button
                              type="button"
                              aria-label={`${n.label} menu`}
                              aria-expanded={menu === n.menu}
                              aria-haspopup="true"
                              onClick={() => setMenu((m) => (m === n.menu ? null : n.menu!))}
                              className="sr-only focus:not-sr-only focus:ml-1 focus:px-1 text-[10px]"
                            >
                              ▾
                            </button>
                          </span>
                        ) : (
                          <Link href={n.href} aria-current={active ? "page" : undefined} className="link-u whitespace-nowrap py-1 font-mono text-[11.5px] font-medium uppercase tracking-[0.1em]">
                            {n.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Center */}
            <Link href="/" aria-label="Threads Ware — home" className="justify-self-center">
              <Wordmark compact={scrolled} className={transparent ? undefined : "text-burgundy"} />
            </Link>

            {/* Right */}
            <div className="flex items-center justify-end gap-0.5 md:gap-2">
              <button type="button" onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 p-2 lg:flex" aria-label="Search">
                <SearchIcon />
                <span className="hidden font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] min-[1520px]:inline">Search</span>
              </button>
              <Link href={user ? "/account" : "/account/login"} className="hidden p-2 md:block" aria-label={user ? `Account — ${user.firstName}` : "Sign in"}>
                <UserIcon />
              </Link>
              <Link href="/wishlist" className="relative hidden p-2 md:block" aria-label={`Wishlist${hydrated && wishlist.length ? `, ${wishlist.length} items` : ""}`}>
                <HeartIcon />
                {hydrated && <Count n={wishlist.length} />}
              </Link>
              <button type="button" onClick={() => setCartOpen(true)} className="relative -mr-2 grid h-11 w-11 place-items-center" aria-label={`Shopping bag${hydrated && cartCount ? `, ${cartCount} items` : ""}`}>
                <BagIcon />
                {hydrated && <Count n={cartCount} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {menu && (
              <motion.div
                key="mega"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
                data-lenis-prevent
                className="absolute inset-x-0 top-full hidden max-h-[calc(100dvh-120px)] overflow-y-auto overscroll-contain border-b border-line bg-ivory text-ink lg:block"
              >
                <AnimatePresence mode="wait">
                  <motion.div key={menu} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <MegaMenu which={menu} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 hidden bg-night/25 lg:block"
            onMouseEnter={scheduleClose}
            onClick={() => setMenu(null)}
          />
        )}
      </AnimatePresence>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
