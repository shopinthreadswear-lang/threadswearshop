import { handle, ok } from "@/lib/server/http";
import { availableStock, read } from "@/lib/server/store";
import { getProductById } from "@/data/products";

/** Live inventory for a product (catalogue stock minus units sold). */
export const GET = handle(async (req) => {
  const p = getProductById(new URL(req.url).searchParams.get("id") ?? "");
  if (!p) return ok({ stock: {} });
  const stock = await read((db) => Object.fromEntries(p.variants.map((v) => [`${v.color}|${v.size}`, availableStock(db, v.sku, v.stock)])));
  return ok({ stock });
});
