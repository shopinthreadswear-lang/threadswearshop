import Link from "next/link";
import { PolicyPage } from "@/components/content/PolicyPage";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Terms & Conditions", description: "Terms and conditions for shopping at Threads Wear — orders, pricing, payments, delivery, returns and use of our website.", path: "/terms" });

export default function TermsPage() {
  return (
    <PolicyPage
      crumb="Terms & Conditions"
      eyebrow="Legal"
      title="Terms & Conditions"
      intro={<>These terms govern your use of threadswear.in and purchases from Threads Wear Private Limited (GSTIN {site.gstin}). By placing an order you agree to them.</>}
      updated="1 October 2026"
      sections={[
        { id: "orders", title: "Orders", body: <p>An order is a request to purchase. A contract is formed when we confirm dispatch. We may decline or cancel an order — for example, if an item becomes unavailable, a pricing error occurs or we suspect fraud — in which case you’ll receive a full refund.</p> },
        { id: "pricing", title: "Pricing & payment", body: <p>All prices are in Indian Rupees and inclusive of GST. Prices are verified at checkout; the price charged is the price displayed when your order is confirmed. Payments are processed securely by our payment partners.</p> },
        { id: "promotions", title: "Promotions & gift cards", body: <p>Promo codes are limited to one per order, cannot be combined and may have minimum order values. Gift cards are valid for 12 months and are not redeemable for cash.</p> },
        { id: "delivery", title: "Delivery", body: <p>Delivery timelines are estimates. Risk passes to you on delivery. See <Link href="/shipping">Shipping Information</Link>.</p> },
        { id: "returns", title: "Returns", body: <p>Our <Link href="/returns">Returns & Exchanges policy</Link> forms part of these terms and does not affect your statutory rights under the Consumer Protection Act, 2019.</p> },
        { id: "ip", title: "Intellectual property", body: <p>All content on this site — including the Threads Wear name, TW monogram, photography and copy — belongs to Threads Wear and may not be reproduced without permission.</p> },
        { id: "law", title: "Governing law", body: <p>These terms are governed by the laws of India, with exclusive jurisdiction of the courts of Mumbai. Questions? <Link href="/contact">Contact us</Link>.</p> },
      ]}
    />
  );
}
