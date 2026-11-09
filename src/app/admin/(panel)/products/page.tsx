import { getAdmin } from "@/lib/server/admin";
import Link from "next/link";
import { deriveProducts, emptyCatalog } from "@/lib/catalog";
import { categories } from "@/data/categories";
import { LOW_STOCK } from "@/lib/server/admin";
import { availableStock, read } from "@/lib/server/store";
import { formatINR } from "@/lib/site";
import { Card, Empty, PageHeader, Tabs } from "@/components/admin/bits";
import { CsvTools, ProductTable } from "./ProductTable";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; stock?: string; deleted?: string }> }) {
  await getAdmin("products");
  const { q = "", cat = "", stock = "all", deleted } = await searchParams;
  const rows = await read((db) => {
    const state = db.catalog ?? emptyCatalog();
    return deriveProducts(state, { includeHidden: true }).map((p) => {
      const avail = p.variants.map((v) => availableStock(db, v.sku, v.stock));
      return {
        p,
        hidden: !!state.products[p.id]?.hidden,
        custom: state.custom.some((c) => c.id === p.id),
        total: avail.reduce((a, b) => a + b, 0),
        low: avail.filter((n) => n > 0 && n <= LOW_STOCK).length,
        out: avail.filter((n) => n === 0).length,
      };
    });
  });
  const term = q.trim().toLowerCase();
  const shown = rows.filter((r) => (!cat || r.p.category === cat) && (!term || r.p.name.toLowerCase().includes(term) || r.p.sku.toLowerCase().includes(term)) && (stock === "low" ? r.low + r.out > 0 : stock === "out" ? r.out > 0 : stock === "hidden" ? r.hidden : true));
  const link = (s: string) => `/admin/products?stock=${s}${cat ? `&cat=${cat}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <>
      <PageHeader title="Products" sub="Edit names, prices, sale prices, stock and what shows in the shop." action={<Link href="/admin/products/new" className="btn btn-primary btn-sm">Add product</Link>} />
      {deleted && <p role="status" className="mb-4 rounded-chip bg-success/10 px-4 py-3 text-[13px] font-medium text-success">Product deleted.</p>}
      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <input type="hidden" name="stock" value={stock} />
        <label htmlFor="q" className="sr-only">Search products</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by name or SKU" className="field h-11 min-w-0 flex-1 basis-full rounded-full px-5 sm:max-w-sm sm:basis-auto" />
        <label htmlFor="cat" className="sr-only">Category</label>
        <select id="cat" name="cat" defaultValue={cat} className="field h-11 w-auto min-w-0 flex-1 rounded-full px-4 sm:flex-none">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <button className="btn btn-outline btn-sm">Apply</button>
      </form>
      <CsvTools />
      <Tabs
        current={stock}
        items={[
          { key: "all", label: "All", href: link("all"), count: rows.length },
          { key: "low", label: "Low or sold out", href: link("low"), count: rows.filter((r) => r.low + r.out > 0).length },
          { key: "out", label: "Has sold-out sizes", href: link("out"), count: rows.filter((r) => r.out > 0).length },
          { key: "hidden", label: "Hidden", href: link("hidden"), count: rows.filter((r) => r.hidden).length },
        ]}
      />
      {shown.length ? (
        <ProductTable
          rows={shown.map(({ p, hidden, custom, total, low, out }) => ({ id: p.id, name: p.name, sku: p.sku, subcategory: p.subcategory, image: p.images[0], price: formatINR(p.price), compare: p.compareAtPrice ? formatINR(p.compareAtPrice) : undefined, discount: p.discount, hidden, custom, total, low, out }))}
        />
      ) : (
        <Card pad={false}>
          <Empty title="No products match">Try a different name, or clear the category.</Empty>
        </Card>
      )}
      <p className="mt-3 text-[12px] text-muted">{shown.length} of {rows.length} products · hidden pieces are included here but not shown in the shop.</p>
    </>
  );
}
