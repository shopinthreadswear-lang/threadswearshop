import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingPage } from "@/components/listing/ListingPage";
import { categories, categoryGroups, getCategory, slugifyType } from "@/data/categories";
import { products, bestSellers } from "@/data/products";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [...categories.map((c) => ({ category: c.slug })), ...Object.keys(categoryGroups).map((category) => ({ category }))];
}

function resolve(slug: string) {
  const c = getCategory(slug);
  if (c) return { name: c.name, title: c.title, description: c.description, image: c.image, list: products.filter((p) => p.category === slug), types: c.types, group: c.group };
  const g = categoryGroups[slug];
  if (g) return { name: g.name, title: g.title, description: g.description, image: g.image, list: products.filter((p) => g.categories.includes(p.category)), types: [] as string[], group: undefined };
  return null;
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const r = resolve(category);
  if (!r) return {};
  return pageMeta({ title: r.title, description: `${r.description} Shop ${r.title.toLowerCase()} at Threads Wear — complimentary shipping above ₹2,999 and easy 15-day returns.`, path: `/men/${category}`, image: r.image });
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const r = resolve(category);
  if (!r) notFound();
  const list = r.list.length ? r.list : bestSellers();
  const stocked = new Set(r.list.map((p) => p.subcategory));
  return (
    <ListingPage
      eyebrow={category === "designer-wear" ? "The Atelier" : r.group ?? "Clothing"}
      title={r.title}
      description={r.list.length ? r.description : `${r.description} This edit launches later this season — explore our best sellers in the meantime.`}
      image={r.image}
      crumbs={[{ label: "Clothing", href: "/men/clothing" }, ...(category === "clothing" ? [] : [{ label: r.name }])]}
      products={list}
      listName={r.title}
      path={`/men/${category}`}
      facets={category in categoryGroups ? ["category", "type", "size", "color", "fit", "price", "material", "occasion", "discount", "availability"] : undefined}
    >
      {r.types.length > 0 && (
        <nav aria-label={`${r.name} types`} className="container-site no-scrollbar flex gap-2 overflow-x-auto pt-8">
          {r.types
            .filter((t) => stocked.has(t))
            .map((t) => (
              <Link key={t} href={`/men/${category}?type=${slugifyType(t)}`} className="shrink-0 border border-line px-4 py-2 text-[12.5px] transition-colors hover:border-ink">
                {t}
              </Link>
            ))}
        </nav>
      )}
    </ListingPage>
  );
}
