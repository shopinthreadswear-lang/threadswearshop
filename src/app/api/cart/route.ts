import { z } from "zod";
import { getSessionUserId } from "@/lib/server/auth";
import { handle, ok, parse } from "@/lib/server/http";
import { write } from "@/lib/server/store";

const line = z.object({
  key: z.string().max(120),
  productId: z.string().max(20),
  color: z.string().max(40),
  size: z.string().max(20),
  quantity: z.number().int().min(1).max(10),
});

/** Persists a cart snapshot for signed-in shoppers — powers cross-device restore and abandoned-cart flows. */
export const PUT = handle(async (req) => {
  const uid = await getSessionUserId();
  if (!uid) return ok({ synced: false });
  const parsed = await parse(req, z.object({ lines: z.array(line).max(50) }));
  if ("error" in parsed) return parsed.error;
  const lines = await write((db) => {
    const u = db.users.find((x) => x.id === uid);
    if (!u) return [];
    u.cart = { lines: parsed.data.lines, updatedAt: new Date().toISOString() };
    return u.cart.lines;
  });
  return ok({ synced: true, lines });
});

export const GET = handle(async () => {
  const uid = await getSessionUserId();
  if (!uid) return ok({ lines: [] });
  const { read } = await import("@/lib/server/store");
  const lines = await read((db) => db.users.find((u) => u.id === uid)?.cart?.lines ?? []);
  return ok({ lines });
});
