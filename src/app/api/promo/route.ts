import { z } from "zod";
import { fail, handle, ok, parse, rateLimit } from "@/lib/server/http";
import { findPromo } from "@/lib/server/promos";

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "promo", 15);
  if (limited) return limited;
  const parsed = await parse(req, z.object({ code: z.string().trim().min(1).max(30), subtotal: z.number().min(0) }));
  if ("error" in parsed) return parsed.error;
  const promo = findPromo(parsed.data.code);
  if (!promo) return fail("This code isn't valid or has expired.", 404);
  if (promo.minSubtotal && parsed.data.subtotal < promo.minSubtotal) {
    return fail(`This code applies to orders above ₹${promo.minSubtotal.toLocaleString("en-IN")}.`, 422);
  }
  return ok({ promo });
});
