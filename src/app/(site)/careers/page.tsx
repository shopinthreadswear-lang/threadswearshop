import Image from "next/image";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Reveal } from "@/components/ui/Reveal";
import { IMG } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Careers", description: "Join the Threads Wear studio in Mumbai. Open roles in design, production, retail and customer experience.", path: "/careers" });

const ROLES = [
  ["Senior Menswear Designer — Tailoring", "Design", "Mumbai · Full-time"],
  ["Production Merchandiser", "Production", "Mumbai / Tiruppur · Full-time"],
  ["Client Advisor — Flagship Store", "Retail", "Mumbai · Full-time"],
  ["Customer Experience Associate", "Customer Care", "Mumbai · Hybrid"],
  ["Performance Marketing Manager", "Growth", "Mumbai · Hybrid"],
  ["Frontend Engineer (Next.js)", "Technology", "Remote, India · Full-time"],
];

export default function CareersPage() {
  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: "Careers" }]} className="mb-8" />
      <div className="grid items-end gap-10 md:grid-cols-2">
        <div>
          <p className="eyebrow text-muted">Careers</p>
          <h1 className="display-lg mt-4">Build the new standard with us.</h1>
          <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-muted">We’re a small team of designers, makers and operators in Mumbai who care about the details. If you do too, we’d like to hear from you.</p>
        </div>
        <Reveal variant="image" className="relative aspect-[16/11]">
          <Image src={IMG.storeBrowse} alt="The Threads Wear team at work" fill sizes="50vw" className="img-grade object-cover" priority />
        </Reveal>
      </div>
      <section className="mt-20" aria-labelledby="roles">
        <h2 id="roles" className="display-sm mb-8">Open roles</h2>
        <ul className="divide-y divide-line border-y border-line">
          {ROLES.map(([t, team, loc]) => (
            <li key={t}>
              <a href={`mailto:careers@threadswear.in?subject=${encodeURIComponent(t)}`} className="group grid gap-2 py-6 md:grid-cols-12 md:items-center">
                <span className="font-serif text-[23px] md:col-span-6 group-hover:underline">{t}</span>
                <span className="text-[13px] text-muted md:col-span-2">{team}</span>
                <span className="text-[13px] text-muted md:col-span-3">{loc}</span>
                <span className="label-sm text-[11px] md:col-span-1 md:text-right">Apply →</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[13.5px] text-muted">Don’t see your role? Write to <a href="mailto:careers@threadswear.in" className="link-static text-ink">careers@threadswear.in</a> with your portfolio or CV.</p>
      </section>
      <section className="mt-20 grid gap-px bg-line md:grid-cols-3">
        {[
          ["Craft over speed", "We take the time to get things right — in product and in how we work."],
          ["Small team, real ownership", "Everyone shapes the brand. Your work is visible on day one."],
          ["Grow with us", "Learning budgets, mentorship and room to move across disciplines."],
        ].map(([t, d]) => (
          <div key={t} className="bg-ivory p-8">
            <p className="font-serif text-[22px]">{t}</p>
            <p className="mt-2 text-[13.5px] text-muted">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
