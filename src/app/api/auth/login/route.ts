import { z } from "zod";
import { createSession, toPublic } from "@/lib/server/auth";
import { fail, handle, ok, parse, rateLimit, zEmail } from "@/lib/server/http";
import { read, verifyPassword, write } from "@/lib/server/store";
import { site } from "@/lib/site";

const schema = z.object({ email: zEmail, password: z.string().min(1, "Enter your password").max(128), wishlist: z.array(z.string().max(20)).max(100).optional() });

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "login", 8);
  if (limited) return limited;
  const parsed = await parse(req, schema);
  if ("error" in parsed) return parsed.error;
  const { email, password, wishlist } = parsed.data;
  const user = await read((db) => db.users.find((u) => u.email === email));
  // Same message for unknown email and wrong password — avoids account enumeration.
  if (!user || !verifyPassword(password, user.passwordHash)) return fail("That email and password combination didn't match our records.", 401);
  if (user.blocked) return fail(`This account has been suspended. Please contact ${site.email} for help.`, 403);
  const merged = await write((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    if (wishlist?.length) u.wishlist = Array.from(new Set([...u.wishlist, ...wishlist]));
    return u;
  });
  await createSession(user.id);
  return ok({ user: toPublic(merged) });
});
