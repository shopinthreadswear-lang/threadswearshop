import crypto from "crypto";
import { z } from "zod";
import { handle, ok, parse, rateLimit, zEmail } from "@/lib/server/http";
import { write } from "@/lib/server/store";

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "forgot", 5);
  if (limited) return limited;
  const parsed = await parse(req, z.object({ email: zEmail }));
  if ("error" in parsed) return parsed.error;
  const token = crypto.randomBytes(24).toString("base64url");
  const found = await write((db) => {
    const u = db.users.find((x) => x.email === parsed.data.email);
    if (!u) return false;
    db.resetTokens = db.resetTokens.filter((t) => t.userId !== u.id);
    db.resetTokens.push({ tokenHash: crypto.createHash("sha256").update(token).digest("hex"), userId: u.id, expiresAt: new Date(Date.now() + 30 * 60e3).toISOString() });
    return true;
  });
  // In production the link is emailed via your provider; never returned in the response.
  if (found && process.env.NODE_ENV !== "production") console.info(`[dev] Password reset link: /account/reset-password?token=${token}`);
  return ok({ devResetLink: found && process.env.NODE_ENV !== "production" ? `/account/reset-password?token=${token}` : undefined });
});
