import { z } from "zod";
import { fail, handle, ok, parse, rateLimit } from "@/lib/server/http";
import { read } from "@/lib/server/store";

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "track", 12);
  if (limited) return limited;
  const parsed = await parse(req, z.object({ orderId: z.string().trim().toUpperCase().min(4).max(20), contact: z.string().trim().min(5).max(160) }));
  if ("error" in parsed) return parsed.error;
  const { orderId, contact } = parsed.data;
  const digits = contact.replace(/\D/g, "").slice(-10);
  const order = await read((db) =>
    db.orders.find((o) => o.id === (orderId.startsWith("TW-") ? orderId : `TW-${orderId}`) && (o.email === contact.toLowerCase() || (digits.length === 10 && o.phone.replace(/\D/g, "").slice(-10) === digits))),
  );
  if (!order) return fail("We couldn't find an order matching those details. Please check your order number and the email or mobile used at checkout.", 404);
  return ok({
    order: {
      id: order.id,
      status: order.status,
      timeline: order.timeline,
      courier: order.courier,
      expectedDelivery: order.expectedDelivery,
      city: order.shippingAddress.city,
      items: order.items.map((i) => ({ name: i.name, image: i.image, size: i.size, color: i.color, quantity: i.quantity })),
      createdAt: order.createdAt,
    },
  });
});
