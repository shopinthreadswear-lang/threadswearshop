import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/server/auth";
import { read } from "@/lib/server/store";
import { ReturnFlow } from "./ReturnFlow";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { commerce } from "@/lib/site";

export const metadata = { title: "Request a Return or Exchange", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getCurrentUser();
  const orders = user ? await read((db) => db.orders.filter((o) => o.userId === user.id && o.status === "delivered")) : [];
  return (
    <div className="container-site grid gap-14 pb-24 pt-10 md:pt-16 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Breadcrumb items={[{ label: "Returns", href: "/returns" }, { label: "Request" }]} className="mb-8" />
        <p className="eyebrow text-muted">Returns & Exchanges</p>
        <h1 className="display-lg mt-4">Start a return or exchange</h1>
        <p className="mt-4 max-w-xl text-[15px] text-muted">Select your order, the pieces you’d like to send back and how you’d like us to resolve it. We’ll arrange a free pickup within 48 hours.</p>
        <Suspense>
          <ReturnFlow orders={orders} signedIn={!!user} />
        </Suspense>
      </div>
      <aside className="lg:col-span-4">
        <div className="bg-paper p-7 lg:sticky lg:top-[90px]">
          <h2 className="label-sm">Our Return Policy</h2>
          <ul className="mt-5 space-y-3 text-[13.5px] leading-relaxed text-charcoal">
            <li>— {commerce.returnWindowDays} days from delivery to request a return or exchange.</li>
            <li>— Pieces must be unworn, unwashed and have original tags attached.</li>
            <li>— Free doorstep pickup across all serviceable PIN codes.</li>
            <li>— Exchanges are always free and dispatched as soon as pickup is complete.</li>
            <li>— Refunds within 5–7 working days of the item reaching our studio; instant with store credit.</li>
            <li>— Altered or made-to-measure tailoring is final sale.</li>
          </ul>
          <Link href="/returns" className="mt-6 inline-block text-[12.5px] link-static">
            Read the full policy
          </Link>
        </div>
      </aside>
    </div>
  );
}
