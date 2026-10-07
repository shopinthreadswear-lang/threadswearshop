import { z } from "zod";
import { getSessionUserId } from "@/lib/server/auth";
import { fail, handle, ok, parse, rateLimit, zPassword } from "@/lib/server/http";
import { hashPassword, verifyPassword, write } from "@/lib/server/store";

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "pw", 5);
  if (limited) return limited;
  const uid = await getSessionUserId();
  if (!uid) return fail("Please sign in to continue.", 401);
  const parsed = await parse(req, z.object({ current: z.string().min(1).max(128), next: zPassword }));
  if ("error" in parsed) return parsed.error;
  const okay = await write((db) => {
    const u = db.users.find((x) => x.id === uid);
    if (!u || !verifyPassword(parsed.data.current, u.passwordHash)) return false;
    u.passwordHash = hashPassword(parsed.data.next);
    return true;
  });
  if (!okay) return fail("Your current password is incorrect.", 400, { current: "Incorrect password" });
  return ok({});
});
