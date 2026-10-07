"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore, resolveLine } from "@/components/providers/StoreProvider";
import { Drawer } from "@/components/ui/Modal";
import { CartItem } from "./CartItem";
import { FreeShipping } from "./FreeShipping";
import { ArrowRight, Lock } from "@/components/ui/Icons";
import { computeTotals } from "@/lib/pricing";
import { formatINR } from "@/lib/site";
import { track } from "@/lib/analytics";
import { ProductCard } from "@/components/product/ProductCard";
import { bestSellers } from "@/data/products";

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, cartCount, promo } = useStore();
  const router = useRouter();
  const totals = computeTotals({ subtotal, promo });

  useEffect(() => {
    if (cartOpen && lines.length)
      track({ name: "view_cart", value: subtotal, items: lines.map((l) => ({ item_id: l.productId, item_name: resolveLine(l)?.name ?? "", price: resolveLine(l)?.price ?? 0, quantity: l.quantity })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen]);

  const close = () => setCartOpen(false);

  return (
    <Drawer
      open={cartOpen}
      onClose={close}
      title={
        <>
          Your Bag <span className="text-muted">({cartCount})</span>
        </>
      }
      footer={
        lines.length ? (
          <div className="space-y-4 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="label-sm">Subtotal</span>
              <span className="text-[17px]">{formatINR(totals.subtotal - totals.discount)}</span>
            </div>
            <p className="text-[12px] text-muted">Shipping and taxes calculated at checkout. Prices include GST.</p>
            <button
              type="button"
              onClick={() => {
                close();
                router.push("/checkout");
              }}
              className="btn btn-primary btn-block"
            >
              <Lock size={14} /> <span>Secure Checkout</span>
            </button>
            <Link href="/bag" onClick={close} className="btn btn-outline btn-block">
              View Bag
            </Link>
            <p className="text-center text-[11.5px] text-muted">Secure encrypted checkout · UPI · Cards · COD</p>
          </div>
        ) : null
      }
    >
      {lines.length ? (
        <div className="px-6">
          <div className="border-b border-line py-5">
            <FreeShipping subtotal={subtotal} />
          </div>
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <li key={l.key}>
                <CartItem line={l} compact onNavigate={close} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="px-6 py-14 text-center">
          <p className="display-sm">Your bag is empty</p>
          <p className="mx-auto mt-3 max-w-xs text-[14px] text-muted">Discover pieces designed for the way you live.</p>
          <Link href="/new-arrivals" onClick={close} className="btn btn-primary mt-8">
            <span>Shop New Arrivals</span> <ArrowRight className="btn-arrow" size={15} />
          </Link>
          <div className="mt-14 text-left">
            <p className="eyebrow mb-5 text-muted">Most Wanted</p>
            <div className="grid grid-cols-2 gap-3">
              {bestSellers()
                .slice(0, 2)
                .map((p) => (
                  <ProductCard key={p.id} product={p} sizes="200px" />
                ))}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
