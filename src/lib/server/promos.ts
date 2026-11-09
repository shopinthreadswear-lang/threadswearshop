import "server-only";
import type { Promo } from "@/lib/pricing";
import { read, type DB } from "./store";

/** A discount code. Lives server-side only, so codes can't be read from the browser. Managed in /admin/coupons. */
export type Coupon = Promo & {
  id: string;
  active: boolean;
  /** ISO date; the code stops working after this day. */
  expires?: string;
  /** Total uses allowed across all customers. */
  usageLimit?: number;
  used: number;
  createdAt: string;
};

export const DEFAULT_COUPONS: Coupon[] = [
  { id: "cpn_welcome10", code: "WELCOME10", type: "percent", value: 10, description: "10% off your first order", active: true, used: 0, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "cpn_tw500", code: "TW500", type: "fixed", value: 500, minSubtotal: 4999, description: "₹500 off orders above ₹4,999", active: true, used: 0, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "cpn_signature15", code: "SIGNATURE15", type: "percent", value: 15, minSubtotal: 9999, description: "15% off orders above ₹9,999", active: true, expires: "2026-12-31", used: 0, createdAt: "2026-01-01T00:00:00.000Z" },
];

export const coupons = (db: DB) => (db.coupons ??= DEFAULT_COUPONS.map((c) => ({ ...c })));

export function usable(c: Coupon, now = new Date()) {
  if (!c.active) return false;
  if (c.expires && new Date(`${c.expires.slice(0, 10)}T23:59:59+05:30`) < now) return false;
  if (c.usageLimit && c.used >= c.usageLimit) return false;
  return true;
}

export async function findPromo(code: string | undefined | null): Promise<Promo | null> {
  if (!code) return null;
  const c = await read((db) => coupons(db).find((x) => x.code === code.trim().toUpperCase()));
  if (!c || !usable(c)) return null;
  return { code: c.code, type: c.type, value: c.value, minSubtotal: c.minSubtotal, description: c.description };
}
