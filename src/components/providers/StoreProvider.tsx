"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CartLine, PublicUser } from "@/lib/types";
import type { Promo } from "@/lib/pricing";
import { getProductById, imagesFor } from "@/data/products";
import { GIFT_CARD_ID } from "@/lib/giftcards";
import { IMG } from "@/data/images";
import { track } from "@/lib/analytics";

type Toast = { id: number; message: string; tone?: "default" | "success" | "error"; action?: { label: string; href: string } };

type StoreCtx = {
  hydrated: boolean;
  user: PublicUser | null;
  setUser: (u: PublicUser | null) => void;
  refreshUser: () => Promise<void>;
  // cart
  lines: CartLine[];
  cartCount: number;
  subtotal: number;
  addToCart: (l: Omit<CartLine, "key" | "quantity"> & { quantity?: number }, opts?: { silent?: boolean }) => void;
  updateQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  promo: Promo | null;
  setPromo: (p: Promo | null) => void;
  // wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
  // recently viewed
  recentlyViewed: string[];
  pushRecentlyViewed: (productId: string) => void;
  // ui
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  sizeGuide: { open: boolean; category?: string };
  openSizeGuide: (category?: string) => void;
  closeSizeGuide: () => void;
  toasts: Toast[];
  toast: (message: string, opts?: Omit<Toast, "id" | "message">) => void;
  dismissToast: (id: number) => void;
};

const Ctx = createContext<StoreCtx | null>(null);

const KEYS = { cart: "tw.cart.v1", wishlist: "tw.wishlist.v1", recent: "tw.recent.v1", promo: "tw.promo.v1" };

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — state remains in memory */
  }
}

export function resolveLine(l: CartLine) {
  if (l.productId === GIFT_CARD_ID) {
    const amount = Number(l.size);
    return { name: "Digital Gift Card", href: "/gift-cards", image: IMG.giftPattern, price: amount, compareAtPrice: undefined, colorLabel: l.giftCard ? `For ${l.giftCard.recipient}` : "Digital", sizeLabel: `₹${amount.toLocaleString("en-IN")}`, product: null };
  }
  const p = getProductById(l.productId);
  if (!p) return null;
  return { name: p.name, href: `/products/${p.slug}`, image: imagesFor(p, l.color)[0], price: p.price, compareAtPrice: p.compareAtPrice, colorLabel: l.color, sizeLabel: l.size, product: p };
}

export const lineKey = (productId: string, color: string, size: string, extra = "") => `${productId}|${color}|${size}${extra ? `|${extra}` : ""}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUserState] = useState<PublicUser | null>(null);

  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecent] = useState<string[]>([]);
  const [promo, setPromoState] = useState<Promo | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sizeGuide, setSizeGuide] = useState<{ open: boolean; category?: string }>({ open: false });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const mergedFor = useRef<string | null>(null);

  /** Sets the session user; on each new sign-in merges their saved wishlist and restores their cart (cross-device recovery). */
  const setUser = useCallback((u: PublicUser | null) => {
    setUserState(u);
    if (!u) {
      mergedFor.current = null;
      return;
    }
    if (mergedFor.current === u.id) return;
    mergedFor.current = u.id;
    setWishlist((local) => Array.from(new Set([...u.wishlist, ...local])));
    if (u.cart?.lines.length) setLines((local) => (local.length ? local : u.cart!.lines));
  }, []);

  // ── Hydrate from storage (cart recovery for returning visitors) ──
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setLines(load<CartLine[]>(KEYS.cart, []).filter((l) => l.productId === GIFT_CARD_ID || getProductById(l.productId)));
    setWishlist(load<string[]>(KEYS.wishlist, []));
    setRecent(load<string[]>(KEYS.recent, []));
    setPromoState(load<Promo | null>(KEYS.promo, null));
    setHydrated(true);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const json = await res.json();
      setUser(json.user ?? null);
    } catch {
      /* offline — keep guest state */
    }
  }, [setUser]);

  // ── Session: load the signed-in customer once storage has hydrated ──
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { user: PublicUser | null }) => !cancelled && setUser(j.user))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hydrated, setUser]);

  // ── Persist ──
  useEffect(() => {
    if (!hydrated) return;
    save(KEYS.cart, lines);
    if (!user || mergedFor.current !== user.id) return;
    const t = setTimeout(() => {
      fetch("/api/cart", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ lines: lines.filter((l) => l.productId !== GIFT_CARD_ID) }) }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [lines, hydrated, user]);

  useEffect(() => {
    if (!hydrated) return;
    save(KEYS.wishlist, wishlist);
    if (!user || mergedFor.current !== user.id) return;
    const t = setTimeout(() => {
      fetch("/api/wishlist", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: wishlist }) }).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [wishlist, hydrated, user]);

  useEffect(() => {
    if (hydrated) save(KEYS.recent, recentlyViewed);
  }, [recentlyViewed, hydrated]);

  const toast = useCallback((message: string, opts?: Omit<Toast, "id" | "message">) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message, ...opts }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const addToCart = useCallback<StoreCtx["addToCart"]>(
    (l, opts) => {
      const qty = l.quantity ?? 1;
      const key = l.giftCard ? lineKey(l.productId, l.color, l.size, l.giftCard.recipientEmail) : lineKey(l.productId, l.color, l.size);
      setLines((prev) => {
        const existing = prev.find((x) => x.key === key);
        if (existing) return prev.map((x) => (x.key === key ? { ...x, quantity: Math.min(10, x.quantity + qty) } : x));
        return [{ key, productId: l.productId, color: l.color, size: l.size, quantity: qty, giftCard: l.giftCard }, ...prev];
      });
      const r = resolveLine({ key, productId: l.productId, color: l.color, size: l.size, quantity: qty, giftCard: l.giftCard });
      if (r) track({ name: "add_to_cart", value: r.price * qty, items: [{ item_id: l.productId, item_name: r.name, price: r.price, quantity: qty, item_variant: `${l.color} / ${l.size}` }] });
      if (!opts?.silent) setCartOpen(true);
    },
    [],
  );

  const updateQty = useCallback((key: string, qty: number) => {
    setLines((prev) => prev.map((x) => (x.key === key ? { ...x, quantity: Math.max(1, Math.min(10, qty)) } : x)));
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => {
      const l = prev.find((x) => x.key === key);
      const r = l && resolveLine(l);
      if (l && r) track({ name: "remove_from_cart", value: r.price * l.quantity, items: [{ item_id: l.productId, item_name: r.name, price: r.price, quantity: l.quantity }] });
      return prev.filter((x) => x.key !== key);
    });
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setPromoState(null);
    save(KEYS.promo, null);
  }, []);

  const setPromo = useCallback((p: Promo | null) => {
    setPromoState(p);
    save(KEYS.promo, p);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const adding = !wishlist.includes(productId);
      setWishlist((prev) => (adding ? [productId, ...prev.filter((x) => x !== productId)] : prev.filter((x) => x !== productId)));
      const p = getProductById(productId);
      if (p && adding) {
        track({ name: "add_to_wishlist", value: p.price, items: [{ item_id: p.id, item_name: p.name, price: p.price }] });
        toast(`${p.name} saved to your wishlist`, { action: { label: "View", href: "/wishlist" } });
      }
      return adding;
    },
    [wishlist, toast],
  );

  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const pushRecentlyViewed = useCallback((id: string) => {
    setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 12));
  }, []);

  const { cartCount, subtotal } = useMemo(() => {
    let count = 0;
    let sum = 0;
    for (const l of lines) {
      const r = resolveLine(l);
      if (!r) continue;
      count += l.quantity;
      sum += r.price * l.quantity;
    }
    return { cartCount: count, subtotal: sum };
  }, [lines]);

  const value: StoreCtx = {
    hydrated,
    user,
    setUser,
    refreshUser,
    lines,
    cartCount,
    subtotal,
    addToCart,
    updateQty,
    removeLine,
    clearCart,
    promo,
    setPromo,
    wishlist,
    toggleWishlist,
    isWishlisted,
    recentlyViewed,
    pushRecentlyViewed,
    cartOpen,
    setCartOpen,
    searchOpen,
    setSearchOpen,
    sizeGuide,
    openSizeGuide: (category) => setSizeGuide({ open: true, category }),
    closeSizeGuide: () => setSizeGuide((s) => ({ ...s, open: false })),
    toasts,
    toast,
    dismissToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside <StoreProvider>");
  return c;
}
