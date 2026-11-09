import { deriveProducts, emptyCatalog } from "@/lib/catalog";
import { toCSV } from "@/lib/csv";
import { can, getAdminSession } from "@/lib/server/admin";
import { availableStock, read } from "@/lib/server/store";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** All products, one per row. Edit in a spreadsheet and import it back on the Products page. */
export async function GET() {
  if (!can(await getAdminSession(), "products")) return new Response("Not found", { status: 404 });
  const rows = await read((db) => {
    const state = db.catalog ?? emptyCatalog();
    const own = deriveProducts({ ...state, offers: [] }, { includeHidden: true });
    return own.map((p) => {
      const patch = state.products[p.id] ?? {};
      const stock = p.variants.reduce((a, v) => a + availableStock(db, v.sku, v.stock), 0);
      return [p.id, p.name, p.category, p.subcategory, p.price, p.compareAtPrice ?? "", patch.hidden ? "yes" : "no", p.isNew ? "yes" : "no", p.isBestSeller ? "yes" : "no", stock, p.seoTitle ?? "", p.seoDescription ?? "", p.shortDescription, absoluteUrl(`/products/${p.slug}`)];
    });
  });
  const csv = toCSV(["id", "name", "category", "type", "price", "compare_at_price", "hidden", "new", "bestseller", "stock_total", "seo_title", "seo_description", "short_description", "url"], rows);
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="threadsware-products-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
}
