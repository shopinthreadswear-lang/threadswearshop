import Link from "next/link";
import { PolicyPage } from "@/components/content/PolicyPage";
import { pageMeta } from "@/lib/seo";
import { commerce, formatINR } from "@/lib/site";

export const metadata = pageMeta({ title: "Shipping Information", description: "Complimentary shipping on Threads Wear orders above ₹2,999. Delivery timelines, express options, Cash on Delivery and order tracking across India.", path: "/shipping" });

export default function ShippingPage() {
  return (
    <PolicyPage
      crumb="Shipping"
      eyebrow="Customer Care"
      title="Shipping Information"
      intro={<>Every order is quality-checked, packed by hand in our Mumbai studio and dispatched within 24 hours on working days.</>}
      updated="1 October 2026"
      sections={[
        {
          id: "rates",
          title: "Delivery options & rates",
          body: (
            <table>
              <thead>
                <tr><th>Method</th><th>Timeline</th><th>Cost</th></tr>
              </thead>
              <tbody>
                <tr><td>Standard</td><td>2–4 working days (metro) · 4–7 elsewhere</td><td>Complimentary above {formatINR(commerce.freeShippingThreshold)}; otherwise {formatINR(commerce.standardShipping)}</td></tr>
                <tr><td>Express</td><td>1–2 working days, select metro PIN codes</td><td>{formatINR(commerce.expressShipping)}</td></tr>
                <tr><td>Cash on Delivery</td><td>As per method selected</td><td>{formatINR(commerce.codFee)} handling fee · orders up to {formatINR(commerce.codLimit)}</td></tr>
              </tbody>
            </table>
          ),
        },
        { id: "dispatch", title: "Dispatch times", body: <p>Orders placed before 2pm IST, Monday to Saturday, are dispatched the same day. Orders placed after 2pm or on Sundays and public holidays are dispatched the next working day. Made-to-order tailoring ships within 10 working days and is marked clearly on the product page.</p> },
        { id: "coverage", title: "Where we deliver", body: <><p>We deliver to over 19,000 PIN codes across India through Blue Dart, Delhivery and Shiprocket partners. Check your PIN code on any product page for an exact delivery estimate.</p><p>We don’t yet ship internationally — international delivery to the UAE, UK, USA and Singapore launches in early 2027.</p></> },
        { id: "tracking", title: "Tracking your order", body: <p>You’ll receive an SMS and email with your courier and tracking number as soon as your order ships. Follow it any time on our <Link href="/track-order">Track Order</Link> page, or in <Link href="/account/orders">My Account</Link>.</p> },
        { id: "packaging", title: "Packaging", body: <p>Every order arrives in our matte black rigid box, tissue-wrapped and sealed, with a handwritten note. Our packaging is plastic-free and fully recyclable. If you’d prefer minimal packaging, add a note at checkout.</p> },
        { id: "issues", title: "Delays & damaged parcels", body: <p>If your parcel is delayed beyond the estimated date or arrives damaged, please contact us within 48 hours at <a href="mailto:shopinthreadswear@gmail.com">shopinthreadswear@gmail.com</a> with your order number and a photo. We’ll make it right — usually with a replacement dispatched the same day.</p> },
      ]}
    />
  );
}
