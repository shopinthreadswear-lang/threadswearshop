import Image from "next/image";
import Link from "next/link";
import { collections } from "@/data/collections";
import { byCollection } from "@/data/products";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Reveal } from "@/components/ui/Reveal";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata = pageMeta({ title: "Collections", description: "Explore Threads Wear collections — The Signature Collection, The Essentials, Modern Tailoring, The Linen Edit, After Dark, Winter Layers and more.", path: "/collections" });

export default function CollectionsPage() {
  const [first, ...rest] = collections;
  return (
    <>
      <section className="container-site pb-12 pt-10 md:pt-16">
        <Breadcrumb items={[{ label: "Collections" }]} className="mb-8" />
        <p className="eyebrow mb-4 text-muted">The Edits</p>
        <h1 className="display-lg max-w-3xl">Collections</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">Curated stories, each built around a mood, a season or a moment. Explore the full Threads Wear world.</p>
      </section>

      <section className="container-site pb-24">
        <Link href={`/collections/${first.slug}`} className="group relative mb-4 block aspect-[4/5] overflow-hidden bg-night text-ivory md:aspect-[21/9]">
          <Image src={first.image} alt={first.name} fill priority sizes="100vw" className="img-grade object-cover opacity-85 transition-transform duration-[1600ms] ease-[var(--ease-lux)] group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/75 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-12">
            <p className="eyebrow text-champagne-soft">Featured · {byCollection(first.slug).length} pieces</p>
            <h2 className="display-lg mt-4">{first.name}</h2>
            <p className="mt-3 max-w-md text-[15px] text-ivory/75">{first.tagline}</p>
          </div>
        </Link>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={(i % 3) * 80} className={cn(i % 5 === 0 && "lg:row-span-1")}>
              <Link href={`/collections/${c.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-bone">
                  <Image src={c.image} alt={c.name} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" className="img-grade object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]" />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-[26px] leading-tight">
                    <span className="link-u">{c.name}</span>
                  </h2>
                  <span className="shrink-0 text-[12px] text-faint">{byCollection(c.slug).length} pieces</span>
                </div>
                <p className="mt-1 text-[13.5px] text-muted">{c.tagline}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
