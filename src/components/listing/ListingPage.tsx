import Image from "next/image";
import { Suspense } from "react";
import type { Product } from "@/lib/types";
import { ListingView } from "./ListingView";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductCardSkeleton } from "@/components/product/ProductCard";
import type { FacetKey, SortId } from "@/lib/filters";
import { JsonLd } from "@/components/ui/JsonLd";
import { absoluteUrl } from "@/lib/site";

export function ListingSkeleton() {
  return (
    <div className="container-site grid grid-cols-2 gap-x-3 gap-y-10 py-12 md:grid-cols-4 md:gap-x-5">
      {Array.from({ length: 8 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListingPage({
  eyebrow,
  title,
  description,
  image,
  crumbs,
  products,
  listName,
  path,
  facets,
  defaultSort,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  crumbs: { label: string; href?: string }[];
  products: Product[];
  listName: string;
  path: string;
  facets?: FacetKey[];
  defaultSort?: SortId;
  children?: React.ReactNode;
}) {
  return (
    <>
      {image ? (
        <section className="relative flex min-h-[240px] overflow-hidden bg-night text-ivory sm:min-h-[300px] md:h-[52vh] md:min-h-[340px]">
          <Image src={image} alt="" fill priority sizes="100vw" className="ken-burns img-grade object-cover object-[50%_35%] opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/75 via-night/15 to-night/10" />
          <div className="container-site relative flex w-full flex-col justify-end pb-7 pt-10 md:pb-14 md:pt-0">
            <Breadcrumb items={crumbs} light className="mb-4 md:mb-6" />
            {eyebrow && <p className="eyebrow mb-3 text-champagne-soft md:mb-4">{eyebrow}</p>}
            <h1 className="display-lg max-w-4xl">{title}</h1>
            <p className="mt-3 line-clamp-2 max-w-xl text-[14px] leading-relaxed text-ivory/80 md:mt-5 md:line-clamp-none md:text-[15px]">{description}</p>
          </div>
        </section>
      ) : (
        <section className="container-site pb-10 pt-10 md:pt-16">
          <Breadcrumb items={crumbs} className="mb-8" />
          {eyebrow && <p className="eyebrow mb-4 text-muted">{eyebrow}</p>}
          <h1 className="display-lg">{title}</h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">{description}</p>
        </section>
      )}
      {children}
      <Suspense fallback={<ListingSkeleton />}>
        <ListingView ids={products.map((p) => p.id)} listName={listName} facets={facets} defaultSort={defaultSort} />
      </Suspense>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url: absoluteUrl(path),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: products.length,
            itemListElement: products.slice(0, 24).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/products/${p.slug}`), name: p.name })),
          },
        }}
      />
    </>
  );
}
