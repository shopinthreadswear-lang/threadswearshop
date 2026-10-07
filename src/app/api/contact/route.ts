import { z } from "zod";
import { handle, ok, parse, rateLimit, zEmail, zName } from "@/lib/server/http";
import { newId, write } from "@/lib/server/store";

const schema = z.object({
  name: zName,
  email: zEmail,
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  orderNumber: z.string().trim().max(20).optional().or(z.literal("")),
  topic: z.enum(["Orders & Delivery", "Returns & Exchanges", "Product Information", "Sizing Advice", "Payments", "General Enquiry"]),
  message: z.string().trim().min(10, "Please add a few more details").max(2000),
});

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "contact", 4);
  if (limited) return limited;
  const parsed = await parse(req, schema);
  if ("error" in parsed) return parsed.error;
  const ticket = await write((db) => {
    const m = { id: newId("msg"), ...parsed.data, phone: parsed.data.phone || undefined, orderNumber: parsed.data.orderNumber || undefined, createdAt: new Date().toISOString() };
    db.contactMessages.unshift(m);
    return `CS-${m.id.slice(-6).toUpperCase()}`;
  });
  return ok({ ticket });
});
