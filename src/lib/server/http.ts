import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";

/** Branded, non-leaky error responses. Raw errors are logged server-side only. */
export function fail(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json({ ok: false, error: message, fields }, { status });
}

export function ok<T extends object>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data }, init);
}

export async function parse<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<{ data: z.infer<T> } | { error: Response }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: fail("We couldn't read that request. Please try again.") };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) fields[issue.path.join(".")] ??= issue.message;
    return { error: fail("Please check the highlighted fields.", 422, fields) };
  }
  return { data: result.data };
}

export function handle(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (e) {
      console.error("[api]", e);
      return fail("Something went wrong. Please try again.", 500);
    }
  };
}

const buckets = new Map<string, { count: number; reset: number }>();
/** Simple fixed-window limiter. Swap for Upstash/Redis when horizontally scaled. */
export function rateLimit(req: Request, key: string, limit = 10, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const b = buckets.get(id);
  if (!b || b.reset < now) {
    buckets.set(id, { count: 1, reset: now + windowMs });
    return null;
  }
  b.count++;
  if (b.count > limit) return fail("Too many attempts. Please wait a moment and try again.", 429);
  return null;
}

export const zEmail = z.string().trim().toLowerCase().email("Enter a valid email address").max(160);
export const zPhone = z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");
export const zPincode = z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code");
export const zName = z.string().trim().min(2, "Please enter your name").max(80);
export const zPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");
