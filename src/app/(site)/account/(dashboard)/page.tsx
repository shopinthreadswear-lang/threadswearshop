import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/server/auth";
import { read } from "@/lib/server/store";
import { OrderCard } from "@/components/account/OrderCard";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { TextLink } from "@/components/ui/CTA";
import { getProductById, related, bestSellers } from "@/data/products";
import type { Product } from "@/lib/types";
import { syncCatalog } from "@/lib/server/store";

export const metadata = { title: "My Account", robots: { index: false } };

export default async function AccountOverview() {
  await syncCatalog();
  const user = (await getCurrentUser())!;
  const orders = await read((db) => db.orders.filter((o) => o.userId === user.id));
  const recent = orders[0];
  const wish = user.wishlist.map(getProductById).filter(Boolean) as Product[];
  const seed = recent ? getProductById(recent.items[0].productId) : wish[0];
  const recs = (seed ? related(seed, 10) : bestSellers()).filter((p) => !wish.some((w) => w.id === p.id));
  const hour = new Date().getHours();

  return (
    <div className="space-y-16">
      <header>
        <p className="eyebrow text-muted">{hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"}</p>
        <h1 className="display-lg mt-4 uppercase">Welcome back, {user.firstName}</h1>
        <p className="mt-4 text-[14px] text-muted">Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })} · {orders.length} {orders.length === 1 ? "order" : "orders"}</p>
      </header>

      <section aria-labelledby="ro">
        <div className="mb-5 flex items-end justify-between">
          <h2 id="ro" className="label-sm">Recent Order</h2>
          {orders.length > 0 && <TextLink href="/account/orders">All Orders</TextLink>}
        </div>
        {recent ? (
          <OrderCard order={recent} />
        ) : (
          <div className="border border-line p-10 text-center">
            <p className="font-serif text-[24px]">No orders yet.</p>
            <Link href="/new-arrivals" className="btn btn-primary btn-sm mt-6">
              Shop New Arrivals
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="wp">
        <div className="mb-5 flex items-end justify-between">
          <h2 id="wp" className="label-sm">Wishlist</h2>
          <TextLink href="/account/wishlist">View Wishlist</TextLink>
        </div>
        {wish.length ? (
          <ul className="grid grid-cols-3 gap-3 md:grid-cols-5">
            {wish.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                    <Image src={p.images[0]} alt={p.name} fill sizes="20vw" className="img-grade object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-2 truncate text-[12px]">{p.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-muted">Save it for later — tap the heart on any piece.</p>
        )}
      </section>

      <section aria-labelledby="qa" className="grid gap-px bg-line sm:grid-cols-3">
        {[
          ["Track an order", "Live courier updates", "/track-order"],
          ["Start a return", "Free pickup within 15 days", "/returns/request"],
          ["Speak to a stylist", "WhatsApp, Mon–Sat", "/contact"],
        ].map(([t, d, h]) => (
          <Link key={h} href={h} className="group bg-ivory p-6 transition-colors hover:bg-paper">
            <p className="font-serif text-[21px]">{t}</p>
            <p className="mt-1 text-[12.5px] text-muted">{d}</p>
          </Link>
        ))}
      </section>

      <section aria-labelledby="rec">
        <h2 id="rec" className="display-sm mb-8">Recommended for You</h2>
        <ProductCarousel ids={(recs).map((p) => p.id)} label="Recommended for you" />
      </section>
    </div>
  );
}
