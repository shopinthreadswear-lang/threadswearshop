import Link from "next/link";
import { PolicyPage } from "@/components/content/PolicyPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Returns & Exchanges", description: "Free 15-day returns and exchanges with doorstep pickup across India. Refunds within 5–7 working days, or instantly as store credit.", path: "/returns" });

export default function ReturnsPolicy() {
  return (
    <PolicyPage
      crumb="Returns & Exchanges"
      eyebrow="Customer Care"
      title="Returns & Exchanges"
      intro={<>We want you to love every piece. If something isn’t right, you have 15 days to return or exchange it — with free pickup from your door. <Link href="/returns/request" className="link-static text-ink">Start a return →</Link></>}
      updated="1 October 2026"
      aside={<Link href="/returns/request" className="btn btn-primary btn-sm">Start a Return</Link>}
      sections={[
        { id: "window", title: "Our promise", body: <ul><li>15 days from delivery to request a return or exchange.</li><li>Free doorstep pickup on every return and exchange.</li><li>Exchanges are always free and dispatched as soon as your pickup is complete.</li><li>Refunds within 5–7 working days of your item reaching us — or instantly as store credit.</li></ul> },
        { id: "condition", title: "Condition of items", body: <p>Pieces must be unworn, unwashed and unaltered, with all original tags attached and in their original packaging where possible. Every return is inspected on arrival; items that don’t meet these conditions will be sent back to you.</p> },
        { id: "how", title: "How to return", body: <ul><li>Go to <Link href="/returns/request">Returns & Exchanges</Link> or My Account → Orders.</li><li>Select the order and pieces, a reason and whether you’d like a refund or exchange.</li><li>We’ll confirm a pickup slot by SMS and email within a few hours.</li><li>Hand the parcel to our courier — no printing required.</li></ul> },
        { id: "refunds", title: "Refunds", body: <p>Refunds are issued to your original payment method. Cash on Delivery orders are refunded by bank transfer (NEFT) or as store credit. Shipping and COD fees are non-refundable unless the item was faulty or incorrect.</p> },
        { id: "exceptions", title: "Exceptions", body: <ul><li>Altered or made-to-measure tailoring is final sale.</li><li>Limited Edition and Archive Sale pieces are eligible for size exchange only.</li><li>Gift cards are non-refundable.</li></ul> },
        { id: "faulty", title: "Faulty or incorrect items", body: <p>If you receive a damaged, faulty or incorrect item, contact us within 48 hours with photos. We’ll arrange a priority pickup and send a replacement immediately, or refund you in full including shipping.</p> },
      ]}
    />
  );
}
