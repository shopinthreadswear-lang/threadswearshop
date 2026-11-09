import { notFound } from "next/navigation";
import { products, getProduct, related, byCollection } from "@/data/products";
import { getCategory } from "@/data/categories";
import { getCollection } from "@/data/collections";
import { seededReviews } from "@/data/reviews";
import { ProductView } from "@/components/product/ProductView";
import { Reviews } from "@/components/product/Reviews";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import { TextLink } from "@/components/ui/CTA";
import { absoluteUrl, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import type { Product } from "@/lib/types";
import { syncCatalog } from "@/lib/server/store";

type Props = { params: Promise<{ slug: string }> };

// Products added in the admin don’t exist at build time, so render unknown slugs on demand (unknown → 404).
export const dynamicParams = true;

export async function generateStaticParams() {
  await syncCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  await syncCatalog();
  const p = getProduct((await params).slug);
  if (!p) return {};
  return pageMeta({ title: p.seoTitle || p.name, description: p.seoDescription || `${p.shortDescription} ${p.materials}. ₹${p.price.toLocaleString("en-IN")} — complimentary shipping above ₹2,999 and easy 15-day returns.`, path: `/products/${p.slug}`, image: p.images[0] });
}

function Rail({ title, items, href, linkLabel }: { title: string; items: Product[]; href?: string; linkLabel?: string }) {
  if (!items.length) return null;
  return (
    <section className="border-t border-line py-16 md:py-20" aria-label={title}>
      <div className="mb-8 flex items-end justify-between gap-6">
        <h2 className="display-sm">{title}</h2>
        {href && <TextLink href={href}>{linkLabel ?? "View all"}</TextLink>}
      </div>
      <ProductCarousel ids={(items).map((p) => p.id)} label={title} />
    </section>
  );
}

export default async function ProductPage({ params }: Props) {
  await syncCatalog();
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const cat = getCategory(p.category);
  const collection = getCollection(p.collection[0]);
  const reviews = seededReviews(p);
  const completeTheLook = (p.completeTheLook ?? []).map(getProduct).filter(Boolean) as Product[];
  const ctl = completeTheLook.length ? completeTheLook : related(p, 12).filter((x) => x.category !== p.category).slice(0, 4);
  const alsoLike = related(p, 10).filter((x) => !ctl.some((c) => c.id === x.id));
  const moreFromCollection = collection ? byCollection(collection.slug).filter((x) => x.id !== p.id) : [];

  return (
    <>
      <div className="container-site pt-4 md:pt-8">
        <Breadcrumb items={[{ label: cat?.name ?? "Shop", href: `/men/${p.category}` }, { label: p.name }]} className="mb-5 hidden md:block" />
        <ProductView product={p} />
        <Reviews product={p} seeded={reviews} />
        <Rail title="Complete the Look" items={ctl} />
        <Rail title="You May Also Like" items={alsoLike} href={`/men/${p.category}`} linkLabel={`All ${cat?.name ?? "pieces"}`} />
        <RecentlyViewed excludeId={p.id} />
        {collection && <Rail title={`More from ${collection.name}`} items={moreFromCollection} href={`/collections/${collection.slug}`} linkLabel="Explore the collection" />}
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": absoluteUrl(`/products/${p.slug}#product`),
          name: p.name,
          description: p.description,
          sku: p.sku,
          mpn: p.sku,
          image: p.images.map((i) => `${i}?w=1200&auto=format`),
          brand: { "@type": "Brand", name: site.shortName },
          material: p.materials,
          color: p.colors.map((c) => c.name).join(", "),
          category: cat?.title,
          aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount, bestRating: 5 },
          review: reviews.slice(0, 3).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.date,
            name: r.title,
            reviewBody: r.body,
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
          })),
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: p.price,
            highPrice: p.price,
            offerCount: p.variants.length,
            availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: absoluteUrl(`/products/${p.slug}`),
            seller: { "@type": "Organization", name: site.shortName },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
              shippingRate: { "@type": "MonetaryAmount", value: p.price >= 2999 ? 0 : 149, currency: "INR" },
              deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" }, transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 7, unitCode: "DAY" } },
            },
            hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", applicableCountry: "IN", returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow", merchantReturnDays: 15, returnMethod: "https://schema.org/ReturnByMail", returnFees: "https://schema.org/FreeReturn" },
          },
        }}
      />
    </>
  );
}
