import { deriveProducts, emptyCatalog } from "@/lib/catalog";
import { toCSV } from "@/lib/csv";
import { can, getAdminSession } from "@/lib/server/admin";
import { availableStock, read } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** Stock on hand for every colour and size. Change the stock column and import it back to update counts. */
export async function GET() {
  if (!can(await getAdminSession(), "products")) return new Response("Not found", { status: 404 });
  const rows = await read((db) =>
    deriveProducts(db.catalog ?? emptyCatalog(), { includeHidden: true }).flatMap((p) => p.variants.map((v) => [v.sku, p.name, v.color, v.size, availableStock(db, v.sku, v.stock)])),
  );
  const csv = toCSV(["sku", "product", "colour", "size", "stock"], rows);
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="threadswear-stock-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
}
