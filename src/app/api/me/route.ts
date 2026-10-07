import { z } from "zod";
import { getSessionUserId, toPublic } from "@/lib/server/auth";
import { fail, handle, ok, parse, zEmail, zName, zPhone } from "@/lib/server/http";
import { read, write } from "@/lib/server/store";

export const GET = handle(async () => {
  const uid = await getSessionUserId();
  if (!uid) return ok({ user: null });
  const user = await read((db) => db.users.find((u) => u.id === uid));
  return ok({ user: user ? toPublic(user) : null });
});

const schema = z.object({
  firstName: zName.optional(),
  lastName: zName.optional(),
  email: zEmail.optional(),
  phone: zPhone.optional().or(z.literal("")),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  preferences: z
    .object({ newsletter: z.boolean(), sms: z.boolean(), whatsapp: z.boolean(), preferredSize: z.string().max(10).optional(), preferredFit: z.string().max(20).optional() })
    .optional(),
});

export const PATCH = handle(async (req) => {
  const uid = await getSessionUserId();
  if (!uid) return fail("Please sign in to continue.", 401);
  const parsed = await parse(req, schema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;
  const result = await write((db) => {
    if (d.email && db.users.some((u) => u.email === d.email && u.id !== uid)) return "taken" as const;
    const u = db.users.find((x) => x.id === uid);
    if (!u) return null;
    if (d.firstName) u.firstName = d.firstName;
    if (d.lastName) u.lastName = d.lastName;
    if (d.email) u.email = d.email;
    if (d.phone !== undefined) u.phone = d.phone || undefined;
    if (d.dob !== undefined) u.dob = d.dob || undefined;
    if (d.preferences) u.preferences = { ...u.preferences, ...d.preferences };
    return u;
  });
  if (result === "taken") return fail("That email is already in use.", 409, { email: "Already in use" });
  if (!result) return fail("Please sign in to continue.", 401);
  return ok({ user: toPublic(result) });
});
