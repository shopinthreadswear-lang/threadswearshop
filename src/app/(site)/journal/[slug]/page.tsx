import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/data/journal";
import { getProduct } from "@/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JournalCard } from "@/components/editorial/JournalCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { absoluteUrl, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import type { Product } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) return {};
  return pageMeta({ title: a.title, description: a.excerpt, path: `/journal/${a.slug}`, image: a.image, type: "article" });
}

export default async function ArticlePage({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const products = (a.products ?? []).map(getProduct).filter(Boolean) as Product[];
  const more = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  const date = new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <article>
      <header className="container-site pt-10 md:pt-16">
        <Breadcrumb items={[{ label: "Journal", href: "/journal" }, { label: a.title }]} className="mb-10" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow text-muted">
            {a.category} · {a.readTime}
          </p>
          <h1 className="display-lg mt-6">{a.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted">{a.excerpt}</p>
          <p className="mt-6 text-[12.5px] text-faint">
            By {a.author} · <time dateTime={a.date}>{date}</time>
          </p>
        </div>
      </header>
      <div className="container-site mt-12">
        <div className="relative aspect-[16/10] overflow-hidden bg-bone md:aspect-[21/9]">
          <Image src={a.image} alt={a.title} fill priority sizes="100vw" className="img-grade object-cover object-[50%_35%]" />
        </div>
      </div>
      <div className="container-site py-16 md:py-24">
        <div className="prose-tw mx-auto max-w-[var(--container-prose)]">
          {a.body.map((b, i) => {
            if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
            if (b.type === "quote")
              return (
                <blockquote key={i} className="my-12 border-l border-ink pl-6 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-snug">
                  “{b.text}”
                </blockquote>
              );
            if (b.type === "image")
              return (
                <figure key={i} className="my-12">
                  <Reveal variant="image" className="relative aspect-[4/3] bg-bone">
                    <Image src={b.src!} alt={b.caption ?? ""} fill sizes="(max-width:768px) 100vw, 720px" className="img-grade object-cover" />
                  </Reveal>
                  {b.caption && <figcaption className="mt-3 text-[12.5px] text-muted">{b.caption}</figcaption>}
                </figure>
              );
            return <p key={i}>{b.text}</p>;
          })}
        </div>
      </div>
      {products.length > 0 && (
        <section className="border-t border-line bg-paper section-y">
          <div className="container-site">
            <p className="eyebrow text-muted">Shop the Story</p>
            <h2 className="display-md mb-12 mt-4">Pieces in this article</h2>
            <ProductGrid products={products} />
          </div>
        </section>
      )}
      <section className="container-site section-y">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="display-sm">More from the Journal</h2>
          <Link href="/journal" className="label-sm link-u">All Stories</Link>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {more.map((m) => (
            <JournalCard key={m.slug} article={m} />
          ))}
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.excerpt,
          image: `${a.image}?w=1200&auto=format`,
          datePublished: a.date,
          author: { "@type": "Person", name: a.author.split(",")[0] },
          publisher: { "@type": "Organization", name: site.shortName, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
          mainEntityOfPage: absoluteUrl(`/journal/${a.slug}`),
        }}
      />
    </article>
  );
}
