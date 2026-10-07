import { z } from "zod";
import { getSessionUserId } from "@/lib/server/auth";
import { fail, handle, ok, parse } from "@/lib/server/http";
import { newId, write } from "@/lib/server/store";
import type { SavedPayment } from "@/lib/types";

function luhn(num: string) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = +num[i];
    if (dbl) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function brand(n: string) {
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^(60|65|81|82|508)/.test(n)) return "RuPay";
  return "Card";
}

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("card"),
    number: z.string().transform((s) => s.replace(/\D/g, "")).refine((s) => s.length >= 13 && s.length <= 19 && luhn(s), "Enter a valid card number"),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"),
    holder: z.string().trim().min(2, "Enter the name on card").max(60),
  }),
  z.object({ type: z.literal("upi"), vpa: z.string().trim().regex(/^[\w.-]{2,}@[a-zA-Z]{2,}$/, "Enter a valid UPI ID") }),
]);

export const POST = handle(async (req) => {
  const uid = await getSessionUserId();
  if (!uid) return fail("Please sign in to continue.", 401);
  const parsed = await parse(req, schema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;
  // Only a tokenised reference is stored — the full PAN never touches our database.
  const entry: SavedPayment =
    d.type === "card"
      ? { id: newId("pm"), type: "card", brand: brand(d.number), last4: d.number.slice(-4), expiry: d.expiry, holder: d.holder.toUpperCase() }
      : { id: newId("pm"), type: "upi", vpa: d.vpa };
  const payments = await write((db) => {
    const u = db.users.find((x) => x.id === uid);
    if (!u) return null;
    if (!u.payments.length) entry.isDefault = true;
    u.payments.push(entry);
    return u.payments;
  });
  return payments ? ok({ payments }) : fail("Please sign in to continue.", 401);
});

export const PATCH = handle(async (req) => {
  const uid = await getSessionUserId();
  if (!uid) return fail("Please sign in to continue.", 401);
  const parsed = await parse(req, z.object({ id: z.string().max(40) }));
  if ("error" in parsed) return parsed.error;
  const payments = await write((db) => {
    const u = db.users.find((x) => x.id === uid);
    if (!u) return null;
    u.payments.forEach((p) => (p.isDefault = p.id === parsed.data.id));
    return u.payments;
  });
  return payments ? ok({ payments }) : fail("Please sign in to continue.", 401);
});

export const DELETE = handle(async (req) => {
  const uid = await getSessionUserId();
  if (!uid) return fail("Please sign in to continue.", 401);
  const parsed = await parse(req, z.object({ id: z.string().max(40) }));
  if ("error" in parsed) return parsed.error;
  const payments = await write((db) => {
    const u = db.users.find((x) => x.id === uid);
    if (!u) return null;
    u.payments = u.payments.filter((p) => p.id !== parsed.data.id);
    if (u.payments.length && !u.payments.some((p) => p.isDefault)) u.payments[0].isDefault = true;
    return u.payments;
  });
  return payments ? ok({ payments }) : fail("Please sign in to continue.", 401);
});
