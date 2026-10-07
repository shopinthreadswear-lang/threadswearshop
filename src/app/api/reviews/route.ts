import { z } from "zod";
import { getSessionUserId } from "@/lib/server/auth";
import { fail, handle, ok, parse, rateLimit } from "@/lib/server/http";
import { newId, read, write } from "@/lib/server/store";
import { getProductById } from "@/data/products";

export const GET = handle(async (req) => {
  const id = new URL(req.url).searchParams.get("productId") ?? "";
  const reviews = await read((db) => db.reviews.filter((r) => r.productId === id));
  return ok({ reviews });
});

const dataUrl = z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).max(400_000, "Images must be under 300KB");

const schema = z.object({
  productId: z.string().max(20),
  author: z.string().trim().min(2, "Enter your name").max(40),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3, "Add a short title").max(80),
  body: z.string().trim().min(20, "Tell us a little more (20+ characters)").max(1500),
  fit: z.enum(["Runs small", "True to size", "Runs large"]),
  quality: z.number().int().min(1).max(5),
  sizePurchased: z.string().max(20),
  images: z.array(dataUrl).max(3).optional(),
});

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "review", 4, 300_000);
  if (limited) return limited;
  const parsed = await parse(req, schema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;
  if (!getProductById(d.productId)) return fail("Product not found.", 404);
  const uid = await getSessionUserId();
  const review = await write((db) => {
    const verified = !!uid && db.orders.some((o) => o.userId === uid && o.items.some((i) => i.productId === d.productId));
    const r = { ...d, id: newId("rev"), verified, date: new Date().toISOString().slice(0, 10), helpful: 0 };
    db.reviews.unshift(r);
    return r;
  });
  return ok({ review });
});
