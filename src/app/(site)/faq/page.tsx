import { FaqView } from "./FaqView";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqs } from "@/data/faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Frequently Asked Questions", description: "Answers on orders, delivery, returns, payments, sizing, products and your Threads Wear account.", path: "/faq" });

export default function FaqPage() {
  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: "FAQ" }]} className="mb-8" />
      <p className="eyebrow text-muted">Help Centre</p>
      <h1 className="display-lg mt-4">Frequently asked questions</h1>
      <FaqView />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.flatMap((c) => c.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))) }} />
    </div>
  );
}
