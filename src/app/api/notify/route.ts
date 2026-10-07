import { z } from "zod";
import { fail, handle, ok, parse, rateLimit } from "@/lib/server/http";
import { write } from "@/lib/server/store";
import { getProductById } from "@/data/products";

const contact = z.string().trim().refine((v) => /^\S+@\S+\.\S+$/.test(v) || /^(\+91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")), "Enter a valid email or 10-digit mobile number");

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "notify", 8);
  if (limited) return limited;
  const parsed = await parse(req, z.object({ productId: z.string().max(20), color: z.string().max(40), size: z.string().max(20), contact }));
  if ("error" in parsed) return parsed.error;
  if (!getProductById(parsed.data.productId)) return fail("Product not found.", 404);
  await write((db) => {
    db.stockAlerts.push({ ...parsed.data, contact: parsed.data.contact.toLowerCase(), createdAt: new Date().toISOString() });
  });
  return ok({});
});
