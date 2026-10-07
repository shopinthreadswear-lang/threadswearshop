import { z } from "zod";
import { fail, handle, ok, parse, rateLimit } from "@/lib/server/http";
import { read } from "@/lib/server/store";

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "gc", 8);
  if (limited) return limited;
  const parsed = await parse(req, z.object({ code: z.string().trim().toUpperCase().min(6).max(40) }));
  if ("error" in parsed) return parsed.error;
  const gc = await read((db) => db.giftCards.find((g) => g.code === parsed.data.code));
  if (!gc) return fail("We couldn't find a gift card with that code.", 404);
  return ok({ balance: gc.balance, initial: gc.initial });
});
