import Image from "next/image";
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/listing/ListingPage";
import { collections, getCollection } from "@/data/collections";
import { byCollection } from "@/data/products";
import { Reveal } from "@/components/ui/Reveal";
import { pageMeta } from "@/lib/seo";
import { syncCatalog } from "@/lib/server/store";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  await syncCatalog();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  await syncCatalog();
  const c = getCollection((await params).slug);
  if (!c) return {};
  return pageMeta({ title: c.name, description: `${c.tagline} ${c.description}`, path: `/collections/${c.slug}`, image: c.image });
}

export default async function CollectionPage({ params }: Props) {
  await syncCatalog();
  const c = getCollection((await params).slug);
  if (!c) notFound();
  const list = byCollection(c.slug);
  return (
    <ListingPage eyebrow="Collection" title={c.name} description={c.tagline} image={c.image} crumbs={[{ label: "Collections", href: "/collections" }, { label: c.name }]} products={list} listName={c.name} path={`/collections/${c.slug}`}>
      <section className="container-site grid items-center gap-10 py-16 md:grid-cols-12 md:py-24">
        <Reveal className="md:col-span-6 md:pr-12">
          <p className="font-serif text-[clamp(1.5rem,2.6vw,2.3rem)] leading-snug">{c.description}</p>
          <p className="eyebrow mt-8 text-muted">{list.length} pieces in this collection</p>
        </Reveal>
        {c.secondaryImage && (
          <Reveal variant="image" className="relative aspect-[16/10] md:col-span-6">
            <Image src={c.secondaryImage} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="img-grade object-cover" />
          </Reveal>
        )}
      </section>
    </ListingPage>
  );
}
