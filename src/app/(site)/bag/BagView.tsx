"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, resolveLine } from "@/components/providers/StoreProvider";
import { CartItem } from "@/components/cart/CartItem";
import { FreeShipping } from "@/components/cart/FreeShipping";
import { PromoCode } from "@/components/cart/PromoCode";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { PaymentBadges } from "@/components/common/PaymentBadges";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ArrowRight, Lock, ReturnIcon, Shield, Truck } from "@/components/ui/Icons";
import { computeTotals } from "@/lib/pricing";
import { bestSellers, getProductById, related } from "@/data/products";
import { track } from "@/lib/analytics";

export function BagView() {
  const { lines, subtotal, promo, hydrated, cartCount } = useStore();
  const router = useRouter();
  const totals = computeTotals({ subtotal, promo });
  const first = lines.map((l) => getProductById(l.productId)).find(Boolean);
  const recs = first ? related(first, 10).filter((p) => !lines.some((l) => l.productId === p.id)) : bestSellers();

  if (!hydrated) return <div className="container-site min-h-[60vh] py-16"><div className="skeleton h-10 w-60" /></div>;

  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: "Shopping Bag" }]} className="mb-8" />
      <h1 className="display-lg">
        Your Bag {cartCount > 0 && <span className="text-faint">({cartCount})</span>}
      </h1>

      {lines.length === 0 ? (
        <div className="mt-12 border-y border-line py-24 text-center">
          <p className="display-md">Your bag is empty</p>
          <p className="mx-auto mt-4 max-w-sm text-[14.5px] text-muted">Discover pieces designed for the way you live.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/new-arrivals" className="btn btn-primary">
              <span>Shop New Arrivals</span> <ArrowRight className="btn-arrow" size={15} />
            </Link>
            <Link href="/wishlist" className="btn btn-outline">
              View Wishlist
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="border-y border-line py-5">
              <FreeShipping subtotal={subtotal} />
            </div>
            <ul className="divide-y divide-line border-b border-line">
              {lines.map((l) => (
                <li key={l.key}>
                  <CartItem line={l} />
                </li>
              ))}
            </ul>
            <Link href="/shop" className="mt-6 inline-flex items-center gap-2 label-sm link-u">
              Continue Shopping
            </Link>
          </div>

          <aside className="lg:col-span-5 xl:col-span-4" aria-label="Order summary">
            <div className="bg-paper p-6 md:p-8 lg:sticky lg:top-[84px]">
              <h2 className="label-sm mb-6">Order Summary</h2>
              <OrderSummary totals={totals} shippingPending={totals.shipping > 0} promoCode={promo?.code} />
              <div className="mt-6 border-t border-line pt-5">
                <PromoCode />
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block mt-6"
                onClick={() => {
                  track({ name: "begin_checkout", value: totals.total, coupon: promo?.code, items: lines.map((l) => ({ item_id: l.productId, item_name: resolveLine(l)?.name ?? "", price: resolveLine(l)?.price ?? 0, quantity: l.quantity })) });
                  router.push("/checkout");
                }}
              >
                <Lock size={14} /> <span>Secure Checkout</span>
              </button>
              <Link href="/shop" className="btn btn-outline btn-block mt-3">
                Continue Shopping
              </Link>
              <p className="mt-4 flex items-center justify-center gap-2 text-[12px] text-muted">
                <Lock size={12} /> Secure encrypted checkout
              </p>
              <PaymentBadges className="mt-4 justify-center" />
              <ul className="mt-6 space-y-3 border-t border-line pt-6 text-[12.5px] text-charcoal">
                <li className="flex items-center gap-3"><Truck size={16} /> Dispatched within 24 hours from Mumbai</li>
                <li className="flex items-center gap-3"><ReturnIcon size={16} /> Free 15-day returns & exchanges</li>
                <li className="flex items-center gap-3"><Shield size={16} /> Every piece quality-checked by hand</li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      <section className="mt-24 border-t border-line pt-16" aria-label="Recommended for you">
        <h2 className="display-sm mb-8">{lines.length ? "Complete Your Look" : "Most Wanted"}</h2>
        <ProductCarousel ids={(recs).map((p) => p.id)} label="Recommended products" />
      </section>
    </div>
  );
}
