import crypto from "crypto";
import { z } from "zod";
import { getSessionUserId, orderToken } from "@/lib/server/auth";
import { fail, handle, ok, parse, rateLimit, zEmail, zName, zPhone, zPincode } from "@/lib/server/http";
import { gateway } from "@/lib/server/payments";
import { findPromo } from "@/lib/server/promos";
import { availableStock, generateOrderId, newId, read, write } from "@/lib/server/store";
import { getProductById } from "@/data/products";
import { computeTotals, deliveryOptions } from "@/lib/pricing";
import { commerce } from "@/lib/site";
import { GIFT_CARD_AMOUNTS, GIFT_CARD_ID } from "@/lib/giftcards";
import type { Order, OrderItem } from "@/lib/types";
import { IMG } from "@/data/images";

const schema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().max(20),
        color: z.string().max(40),
        size: z.string().max(20),
        quantity: z.number().int().min(1).max(10),
        giftCard: z.object({ amount: z.number(), recipient: z.string().max(80), recipientEmail: zEmail, message: z.string().max(300).optional() }).optional(),
      }),
    )
    .min(1, "Your bag is empty")
    .max(50),
  contact: z.object({ email: zEmail, phone: zPhone }),
  address: z.object({
    fullName: zName,
    phone: zPhone,
    line1: z.string().trim().min(5, "Enter your house / flat and street").max(120),
    line2: z.string().trim().max(120).optional().or(z.literal("")),
    city: z.string().trim().min(2, "Enter your city").max(60),
    state: z.string().trim().min(2, "Select your state").max(60),
    pincode: zPincode,
    country: z.literal("India"),
  }),
  saveAddress: z.boolean().optional(),
  delivery: z.enum(["standard", "express"]),
  payment: z.object({
    method: z.enum(["upi", "card", "netbanking", "wallet", "cod", "giftcard"]),
    cardNumber: z.string().max(23).optional(),
    vpa: z.string().max(60).optional(),
    bank: z.string().max(40).optional(),
    wallet: z.string().max(40).optional(),
    giftCardCode: z.string().max(40).optional(),
    label: z.string().max(60).optional(),
  }),
  promoCode: z.string().max(30).optional().or(z.literal("")),
});

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "order", 10);
  if (limited) return limited;
  const parsed = await parse(req, schema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;
  const uid = await getSessionUserId();

  // ── Server-side price & stock verification: client-sent prices are never trusted. ──
  const items: OrderItem[] = [];
  const giftCards: { amount: number; recipientEmail: string }[] = [];
  const stockIssues = await read((db) => {
    const issues: string[] = [];
    for (const l of d.lines) {
      if (l.productId === GIFT_CARD_ID) {
        const amount = Number(l.size);
        if (!GIFT_CARD_AMOUNTS.includes(amount) || !l.giftCard) {
          issues.push("Gift card amount is invalid.");
          continue;
        }
        for (let i = 0; i < l.quantity; i++) giftCards.push({ amount, recipientEmail: l.giftCard.recipientEmail });
        items.push({ productId: GIFT_CARD_ID, slug: "gift-cards", name: "Threads Wear Digital Gift Card", image: IMG.giftPattern, color: "Digital", size: `₹${amount.toLocaleString("en-IN")}`, quantity: l.quantity, unitPrice: amount, lineTotal: amount * l.quantity, sku: `TW-GC-${amount}` });
        continue;
      }
      const p = getProductById(l.productId);
      const v = p?.variants.find((x) => x.color === l.color && x.size === l.size);
      if (!p || !v) {
        issues.push("An item in your bag is no longer available.");
        continue;
      }
      const available = availableStock(db, v.sku, v.stock);
      if (available < l.quantity) {
        issues.push(available === 0 ? `${p.name} (${l.size}) has just sold out.` : `Only ${available} left of ${p.name} in ${l.size}.`);
        continue;
      }
      items.push({ productId: p.id, slug: p.slug, name: p.name, image: (p.colors.find((c) => c.name === l.color)?.images ?? p.images)[0], color: l.color, size: l.size, quantity: l.quantity, unitPrice: p.price, lineTotal: p.price * l.quantity, sku: v.sku });
    }
    return issues;
  });
  if (stockIssues.length) return fail(stockIssues[0], 409);

  const subtotal = items.reduce((a, i) => a + i.lineTotal, 0);
  const promo = findPromo(d.promoCode);
  const giftCardOnly = items.every((i) => i.productId === GIFT_CARD_ID);
  const cod = d.payment.method === "cod";
  if (cod && (subtotal > commerce.codLimit || giftCardOnly)) return fail("Cash on Delivery isn't available for this order.", 422);
  const totals = computeTotals({ subtotal, promo, delivery: d.delivery, cod, giftCardOnly });

  if (d.payment.method === "giftcard") {
    const code = d.payment.giftCardCode?.trim().toUpperCase();
    const gc = await read((db) => db.giftCards.find((g) => g.code === code));
    if (!gc || gc.balance < totals.total) return fail("Your gift card balance doesn't cover this order. Please choose another payment method.", 402);
  }

  const orderId = await read(generateOrderId);
  const charge = d.payment.method === "giftcard"
    ? ({ ok: true, reference: `gc_${crypto.randomBytes(5).toString("hex")}`, status: "paid" } as const)
    : await gateway().charge({ method: d.payment.method, amount: totals.total, orderId, details: d.payment });
  if (!charge.ok) return fail(charge.error, 402);

  const now = new Date();
  const metro = /^(11|40|56|60|50|70|41|12|20)/.test(d.address.pincode);
  const etaDays = d.delivery === "express" ? 2 : metro ? 3 : 6;
  const order: Order = {
    id: orderId,
    accessToken: crypto.randomBytes(12).toString("hex"),
    userId: uid ?? undefined,
    email: d.contact.email,
    phone: d.contact.phone,
    items,
    shippingAddress: { ...d.address, line2: d.address.line2 || undefined },
    delivery: { method: d.delivery, label: deliveryOptions[d.delivery].label, eta: deliveryOptions[d.delivery].eta },
    payment: { method: d.payment.method, label: d.payment.label || d.payment.method.toUpperCase(), status: charge.status, reference: charge.reference },
    totals: { subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping, codFee: totals.codFee, tax: totals.tax, total: totals.total },
    promoCode: promo?.code,
    status: "confirmed",
    timeline: [
      { status: "placed", at: now.toISOString() },
      { status: "confirmed", at: now.toISOString(), note: charge.status === "cod" ? "Cash on Delivery confirmed" : "Payment received" },
    ],
    expectedDelivery: new Date(now.getTime() + etaDays * 864e5).toISOString(),
    createdAt: now.toISOString(),
  };

  await write((db) => {
    for (const i of items) if (i.productId !== GIFT_CARD_ID) db.inventoryAdjustments[i.sku] = (db.inventoryAdjustments[i.sku] ?? 0) + i.quantity;
    for (const g of giftCards) {
      const code = `TWGC-${crypto.randomBytes(2).toString("hex").toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      db.giftCards.push({ code, balance: g.amount, initial: g.amount, recipientEmail: g.recipientEmail, createdAt: order.createdAt });
    }
    if (d.payment.method === "giftcard") {
      const gc = db.giftCards.find((g) => g.code === d.payment.giftCardCode?.trim().toUpperCase());
      if (gc) gc.balance -= totals.total;
    }
    db.orders.unshift(order);
    if (uid) {
      const u = db.users.find((x) => x.id === uid);
      if (u) {
        u.cart = { lines: [], updatedAt: order.createdAt };
        if (d.saveAddress && !u.addresses.some((a) => a.line1 === d.address.line1 && a.pincode === d.address.pincode)) {
          u.addresses.push({ id: newId("adr"), label: u.addresses.length ? "Other" : "Home", isDefault: !u.addresses.length, ...d.address, line2: d.address.line2 || undefined });
        }
      }
    }
  });

  return ok({ orderId, token: orderToken(order.id, order.accessToken), total: totals.total });
});
