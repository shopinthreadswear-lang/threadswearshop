import { z } from "zod";
import { createSession, toPublic } from "@/lib/server/auth";
import { fail, handle, ok, parse, rateLimit, zEmail, zName, zPassword, zPhone } from "@/lib/server/http";
import { hashPassword, newId, write } from "@/lib/server/store";
import type { User } from "@/lib/types";

const schema = z.object({
  firstName: zName,
  lastName: zName,
  email: zEmail,
  phone: zPhone.optional().or(z.literal("")),
  password: zPassword,
  newsletter: z.boolean().optional(),
  wishlist: z.array(z.string().max(20)).max(100).optional(),
});

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "register", 5);
  if (limited) return limited;
  const parsed = await parse(req, schema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;
  const user = await write((db) => {
    if (db.users.some((u) => u.email === d.email)) return null;
    const u: User = {
      id: newId("usr"),
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone || undefined,
      passwordHash: hashPassword(d.password),
      createdAt: new Date().toISOString(),
      addresses: [],
      payments: [],
      wishlist: d.wishlist ?? [],
      preferences: { newsletter: !!d.newsletter, sms: true, whatsapp: false },
    };
    db.users.push(u);
    if (d.newsletter) db.newsletter.push({ email: d.email, source: "register", createdAt: u.createdAt });
    return u;
  });
  if (!user) return fail("An account with this email already exists. Try signing in instead.", 409, { email: "Already registered" });
  await createSession(user.id);
  return ok({ user: toPublic(user) });
});
