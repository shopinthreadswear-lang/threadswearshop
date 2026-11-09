import Link from "next/link";
import { notFound } from "next/navigation";
import { read } from "@/lib/server/store";
import { getSessionUserId, orderToken } from "@/lib/server/auth";
import { OrderItems } from "@/components/orders/OrderItems";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Monogram } from "@/components/ui/Logo";
import { ArrowRight, Check } from "@/components/ui/Icons";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { bestSellers } from "@/data/products";

export const metadata = { title: "Order Confirmed", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> };

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { t } = await searchParams;
  const order = await read((db) => db.orders.find((o) => o.id === id));
  const uid = await getSessionUserId();
  // Only the purchaser (signed-in owner, or holder of the signed link) may view the order.
  if (!order || (orderToken(order.id, order.accessToken) !== t && (!uid || order.userId !== uid))) notFound();
  const eta = new Date(order.expectedDelivery).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const a = order.shippingAddress;

  return (
    <div className="container-site pb-24 pt-12 md:pt-20">
      <div className="mx-auto max-w-3xl text-center">
        <Monogram size={56} className="mx-auto text-burgundy" />
        <p className="eyebrow mt-8 flex items-center justify-center gap-2 text-success">
          <Check size={14} /> Order Confirmed
        </p>
        <h1 className="display-lg mt-5">Thank you for choosing Threads Ware.</h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          Your order <span className="text-ink">{order.id}</span> has been received. A confirmation has been sent to <span className="text-ink">{order.email}</span>. We’ll message you again when it ships.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/track-order?order=${order.id}&contact=${encodeURIComponent(order.email)}`} className="btn btn-primary">
            <span>Track Order</span> <ArrowRight className="btn-arrow" size={15} />
          </Link>
          <Link href="/new-arrivals" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-12 border-t border-line pt-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="label-sm mb-4">Items</h2>
          <OrderItems items={order.items} />
          <dl className="mt-10 grid gap-8 text-[13.5px] sm:grid-cols-2">
            <div>
              <dt className="field-label">Order Number</dt>
              <dd className="text-muted">{order.id}</dd>
            </div>
            <div>
              <dt className="field-label">Expected Delivery</dt>
              <dd className="text-muted">{eta}</dd>
            </div>
            <div>
              <dt className="field-label">Shipping Address</dt>
              <dd className="leading-relaxed text-muted">
                {a.fullName}
                <br />
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} {a.pincode}
                <br />
                {a.phone}
              </dd>
            </div>
            <div>
              <dt className="field-label">Payment</dt>
              <dd className="text-muted">
                {order.payment.label}
                <br />
                {order.payment.status === "cod" ? "Pay on delivery" : "Paid"} {order.payment.reference && <span className="text-faint">· Ref {order.payment.reference}</span>}
              </dd>
            </div>
          </dl>
        </div>
        <aside className="lg:col-span-2">
          <div className="bg-paper p-7">
            <h2 className="label-sm mb-6">Payment Summary</h2>
            <OrderSummary totals={order.totals} promoCode={order.promoCode} />
          </div>
          {!uid && (
            <div className="mt-4 border border-line p-7">
              <p className="font-serif text-[22px]">Save your details for next time</p>
              <p className="mt-2 text-[13px] text-muted">Create an account to track orders, request returns in a tap and keep your wishlist across devices.</p>
              <Link href={`/account/register?email=${encodeURIComponent(order.email)}`} className="btn btn-outline btn-sm mt-5">
                Create Account
              </Link>
            </div>
          )}
        </aside>
      </div>

      <section className="mt-24 border-t border-line pt-16">
        <h2 className="display-sm mb-8">You might also like</h2>
        <ProductCarousel ids={(bestSellers().filter((p) => !order.items.some((i) => i.productId === p.id))).map((p) => p.id)} label="Recommendations" />
      </section>
    </div>
  );
}
