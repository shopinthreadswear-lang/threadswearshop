import { ContactForm } from "./ContactForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Chat, Mail, Phone, Pin } from "@/components/ui/Icons";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";

export const metadata = pageMeta({ title: "Contact Us", description: "Reach Threads Wear Customer Care by WhatsApp, email or phone — Monday to Saturday, 10am to 8pm IST. Help with orders, delivery, returns, sizing and more.", path: "/contact" });

const TOPICS = [
  ["Customer Care", "General help with your account, orders and payments.", "/faq#orders"],
  ["Orders & Delivery", "Track a parcel, change an address or ask about timelines.", "/track-order"],
  ["Returns & Exchanges", "Free pickup within 15 days of delivery.", "/returns/request"],
  ["Product Information", "Fabrics, fit and care — our stylists can help.", "/size-guide"],
  ["General Enquiries", "Press, partnerships and wholesale.", "mailto:hello@threadswear.in"],
];

export default function ContactPage() {
  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: "Contact" }]} className="mb-8" />
      <header className="max-w-3xl">
        <p className="eyebrow text-muted">Customer Care</p>
        <h1 className="display-lg mt-4">How can we help?</h1>
        <p className="mt-5 text-[15.5px] leading-relaxed text-muted">Real people, not bots. We reply to WhatsApp within the hour and email within one working day. {site.hours}.</p>
      </header>

      <ul className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {[
          [Chat, "WhatsApp", site.whatsapp, site.whatsappHref, "Fastest — replies within the hour"],
          [Mail, "Email", site.email, `mailto:${site.email}`, "Replies within 1 working day"],
          [Phone, "Phone", site.phone, site.phoneHref, site.hours],
          [Pin, "Studio", "Lower Parel, Mumbai", "/stores", "By appointment"],
        ].map(([Icon, t, v, h, d]) => {
          const I = Icon as typeof Chat;
          return (
            <li key={t as string} className="bg-ivory">
              <a href={h as string} className="group block h-full p-7 transition-colors hover:bg-paper" {...((h as string).startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <I size={22} className="text-burgundy" />
                <p className="label-sm mt-6">{t as string}</p>
                <p className="mt-2 font-serif text-[21px] group-hover:underline">{v as string}</p>
                <p className="mt-1 text-[12.5px] text-muted">{d as string}</p>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-20 grid gap-14 lg:grid-cols-12">
        <section className="lg:col-span-5" aria-labelledby="topics">
          <h2 id="topics" className="display-sm">Find answers fast</h2>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {TOPICS.map(([t, d, h]) => (
              <li key={t}>
                <Link href={h} className="group flex items-center justify-between gap-6 py-5">
                  <span>
                    <span className="block font-serif text-[21px]">{t}</span>
                    <span className="mt-1 block text-[13px] text-muted">{d}</span>
                  </span>
                  <span className="text-muted transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[13px] text-muted">
            Threads Wear Private Limited · {site.address.line1}, {site.address.line2}, {site.address.city} {site.address.pincode} · GSTIN {site.gstin}
          </p>
        </section>
        <section className="lg:col-span-7" aria-labelledby="form-title">
          <div className="bg-paper p-7 md:p-10">
            <h2 id="form-title" className="display-sm">Send us a message</h2>
            <p className="mt-2 text-[13.5px] text-muted">Include your order number if your message is about an order.</p>
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  );
}
