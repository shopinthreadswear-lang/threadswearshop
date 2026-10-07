import { z } from "zod";
import { getSessionUserId } from "@/lib/server/auth";
import { handle, ok, parse } from "@/lib/server/http";
import { write } from "@/lib/server/store";
import { getProductById } from "@/data/products";

export const PUT = handle(async (req) => {
  const uid = await getSessionUserId();
  if (!uid) return ok({ synced: false });
  const parsed = await parse(req, z.object({ ids: z.array(z.string().max(20)).max(200) }));
  if ("error" in parsed) return parsed.error;
  const ids = parsed.data.ids.filter((id) => getProductById(id));
  await write((db) => {
    const u = db.users.find((x) => x.id === uid);
    if (u) u.wishlist = ids;
  });
  return ok({ synced: true });
});
