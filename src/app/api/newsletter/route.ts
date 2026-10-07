import { z } from "zod";
import { handle, ok, parse, rateLimit, zEmail } from "@/lib/server/http";
import { write } from "@/lib/server/store";

export const POST = handle(async (req) => {
  const limited = rateLimit(req, "newsletter", 6);
  if (limited) return limited;
  const parsed = await parse(req, z.object({ email: zEmail, source: z.string().max(30).default("footer") }));
  if ("error" in parsed) return parsed.error;
  const already = await write((db) => {
    if (db.newsletter.some((n) => n.email === parsed.data.email)) return true;
    db.newsletter.push({ ...parsed.data, createdAt: new Date().toISOString() });
    return false;
  });
  // Hook: forward to Klaviyo / Mailchimp / Resend audience here using EMAIL_PROVIDER_API_KEY.
  return ok({ already });
});
