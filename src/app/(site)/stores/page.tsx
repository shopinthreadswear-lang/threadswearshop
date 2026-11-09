import Image from "next/image";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { Reveal } from "@/components/ui/Reveal";
import { IMG } from "@/data/images";
import { site } from "@/lib/site";
import { syncCatalog } from "@/lib/server/store";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Stores — Coming Soon", description: "The first Threads Ware store opens in Mumbai in early 2027. Visit our Lower Parel studio by appointment in the meantime.", path: "/stores", image: IMG.storeInterior });

export default async function StoresPage() {
  await syncCatalog(); // contact details are edited in Admin → Site content
  return (
    <>
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden bg-night text-ivory">
        <Image src={IMG.storeInterior} alt="Threads Ware store concept" fill priority sizes="100vw" className="ken-burns img-grade object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/85 to-night/20" />
        <div className="container-site relative flex h-full flex-col justify-end pb-14">
          <Breadcrumb items={[{ label: "Stores" }]} light className="mb-6" />
          <p className="eyebrow text-champagne-soft">Coming Early 2027</p>
          <h1 className="display-lg mt-4 max-w-3xl">The Threads Ware House, Mumbai.</h1>
        </div>
      </section>
      <section className="container-site grid gap-14 section-y md:grid-cols-2">
        <Reveal>
          <p className="font-serif text-[clamp(1.6rem,2.6vw,2.3rem)] leading-snug">Our first permanent home — a quiet, light-filled space in Kala Ghoda with a tailoring atelier, an alterations bar and a private fitting salon.</p>
          <ul className="mt-10 space-y-4 text-[14.5px] text-charcoal">
            <li>— Complimentary alterations and same-day hemming</li>
            <li>— Made-to-measure tailoring appointments</li>
            <li>— Click & collect and in-store returns</li>
            <li>— Personal styling, by appointment</li>
          </ul>
        </Reveal>
        <Reveal delay={120} className="space-y-10">
          <div className="border border-line p-8">
            <p className="label-sm">Visit the studio today</p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              {site.address.line1}
              <br />
              {site.address.line2}, {site.address.city} {site.address.pincode}
              <br />
              Tuesday – Saturday, 11am – 7pm · By appointment
            </p>
            <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm mt-6">Book an Appointment</a>
          </div>
          <div>
            <p className="label-sm">Be first through the door</p>
            <p className="mb-6 mt-2 text-[13.5px] text-muted">Get an invitation to the opening evening.</p>
            <NewsletterForm source="stores" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
