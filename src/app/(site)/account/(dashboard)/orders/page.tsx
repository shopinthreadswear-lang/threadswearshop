import Link from "next/link";
import { getCurrentUser } from "@/lib/server/auth";
import { read } from "@/lib/server/store";
import { OrderCard } from "@/components/account/OrderCard";

export const metadata = { title: "Order History", robots: { index: false } };

export default async function OrdersPage() {
  const user = (await getCurrentUser())!;
  const orders = await read((db) => db.orders.filter((o) => o.userId === user.id));
  return (
    <>
      <h1 className="display-md">Order History</h1>
      <p className="mt-3 text-[14px] text-muted">Track, return or exchange your orders.</p>
      <div className="mt-10 space-y-5">
        {orders.length ? (
          orders.map((o) => <OrderCard key={o.id} order={o} />)
        ) : (
          <div className="border border-line p-12 text-center">
            <p className="font-serif text-[26px]">You haven’t placed an order yet.</p>
            <Link href="/new-arrivals" className="btn btn-primary mt-6">
              Discover New Arrivals
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
