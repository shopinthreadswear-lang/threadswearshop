import { Suspense } from "react";
import { TrackOrder } from "./TrackOrder";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Track Your Order", description: "Track your Threads Ware order with your order number and email or mobile number. Live courier updates from dispatch to doorstep.", path: "/track-order" });

export default function Page() {
  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: "Track Order" }]} className="mb-8" />
      <p className="eyebrow text-muted">Order Tracking</p>
      <h1 className="display-lg mt-4">Track your order</h1>
      <p className="mt-4 max-w-lg text-[15px] text-muted">Enter your order number and the email or mobile number used at checkout. Signed-in customers can also find every order in their account.</p>
      <Suspense>
        <TrackOrder />
      </Suspense>
    </div>
  );
}
