import { z } from "zod";
import { getSessionUserId } from "@/lib/server/auth";
import { fail, handle, ok, parse, rateLimit } from "@/lib/server/http";
import { newId, read, write } from "@/lib/server/store";
import { commerce } from "@/lib/site";

const schema = z.object({
  orderId: z.string().trim().toUpperCase().max(20),
  contact: z.string().trim().max(160).optional(),
  skus: z.array(z.string().max(60)).min(1, "Select at least one item"),
  reason: z.enum(["Size issue", "Fit issue", "Product damaged", "Wrong item", "Changed mind", "Other"]),
  details: z.string().trim().max(1000).optional(),
  resolution: z.enum(["return", "exchange"]),
  exchangeSize: z.string().max(20).optional(),
  refundMethod: z.enum(["Original payment method", "Store credit (instant)", "Bank transfer"]).optional(),
});

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "returns", 6);
  if (limited) return limited;
  const parsed = await parse(req, schema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;
  const uid = await getSessionUserId();
  const order = await read((db) => db.orders.find((o) => o.id === d.orderId));
  const contactOk = d.contact && order && (order.email === d.contact.toLowerCase() || order.phone.replace(/\D/g, "").endsWith(d.contact.replace(/\D/g, "").slice(-10)));
  if (!order || (order.userId !== uid && !contactOk)) return fail("We couldn't find that order.", 404);
  if (order.status !== "delivered") return fail("Returns can be requested once your order has been delivered.", 422);
  const deliveredAt = order.timeline.find((t) => t.status === "delivered")?.at ?? order.expectedDelivery;
  if (Date.now() - new Date(deliveredAt).getTime() > commerce.returnWindowDays * 864e5) {
    return fail(`This order is outside our ${commerce.returnWindowDays}-day return window. Our Customer Care team will be happy to help.`, 422);
  }
  if (d.resolution === "return" && !d.refundMethod) return fail("Please choose a refund method.", 422, { refundMethod: "Required" });
  const items = order.items.filter((i) => d.skus.includes("*") || d.skus.includes(i.sku)).map((i) => ({ sku: i.sku, name: i.name, quantity: i.quantity }));
  if (!items.length) return fail("Select at least one item.", 422);
  const rr = await write((db) => {
    const r = { id: `RT-${Math.floor(100000 + Math.random() * 899999)}`, orderId: order.id, userId: uid ?? undefined, items, reason: d.reason, details: d.details, resolution: d.resolution, exchangeSize: d.exchangeSize, refundMethod: d.refundMethod, status: "requested" as const, createdAt: new Date().toISOString() };
    db.returns.unshift(r);
    void newId;
    return r;
  });
  return ok({ request: rr });
});
