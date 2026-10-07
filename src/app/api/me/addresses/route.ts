import { z } from "zod";
import { getSessionUserId } from "@/lib/server/auth";
import { fail, handle, ok, parse, zName, zPhone, zPincode } from "@/lib/server/http";
import { newId, write } from "@/lib/server/store";

const address = z.object({
  id: z.string().max(40).optional(),
  label: z.string().trim().min(1).max(30).default("Home"),
  fullName: zName,
  phone: zPhone,
  line1: z.string().trim().min(5, "Enter your house / flat and street").max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().trim().min(2, "Select your state").max(60),
  pincode: zPincode,
  country: z.literal("India").default("India"),
  isDefault: z.boolean().optional(),
});

async function mutate(req: Request, op: "upsert" | "delete") {
  const uid = await getSessionUserId();
  if (!uid) return fail("Please sign in to continue.", 401);
  const parsed = await parse(req, op === "delete" ? z.object({ id: z.string().max(40) }) : address);
  if ("error" in parsed) return parsed.error;
  const addresses = await write((db) => {
    const u = db.users.find((x) => x.id === uid);
    if (!u) return null;
    if (op === "delete") {
      u.addresses = u.addresses.filter((a) => a.id !== (parsed.data as { id: string }).id);
      if (u.addresses.length && !u.addresses.some((a) => a.isDefault)) u.addresses[0].isDefault = true;
      return u.addresses;
    }
    const a = parsed.data as z.infer<typeof address>;
    const record = { ...a, id: a.id || newId("adr"), line2: a.line2 || undefined };
    if (record.isDefault || u.addresses.length === 0) {
      u.addresses.forEach((x) => (x.isDefault = false));
      record.isDefault = true;
    }
    const i = u.addresses.findIndex((x) => x.id === record.id);
    if (i >= 0) u.addresses[i] = record;
    else u.addresses.push(record);
    return u.addresses;
  });
  if (!addresses) return fail("Please sign in to continue.", 401);
  return ok({ addresses });
}

export const POST = handle((req) => mutate(req, "upsert"));
export const DELETE = handle((req) => mutate(req, "delete"));
