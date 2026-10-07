import crypto from "crypto";
import { z } from "zod";
import { createSession } from "@/lib/server/auth";
import { fail, handle, ok, parse, rateLimit, zPassword } from "@/lib/server/http";
import { hashPassword, write } from "@/lib/server/store";

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "reset", 5);
  if (limited) return limited;
  const parsed = await parse(req, z.object({ token: z.string().min(10).max(100), password: zPassword }));
  if ("error" in parsed) return parsed.error;
  const hash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const userId = await write((db) => {
    const t = db.resetTokens.find((x) => x.tokenHash === hash && new Date(x.expiresAt) > new Date());
    if (!t) return null;
    const u = db.users.find((x) => x.id === t.userId);
    if (!u) return null;
    u.passwordHash = hashPassword(parsed.data.password);
    db.resetTokens = db.resetTokens.filter((x) => x.userId !== u.id);
    return u.id;
  });
  if (!userId) return fail("This reset link has expired. Please request a new one.", 410);
  await createSession(userId);
  return ok({});
});
