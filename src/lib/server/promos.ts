import "server-only";
import type { Promo } from "@/lib/pricing";

/** Promotions live server-side so codes can't be enumerated from the client bundle. Move to the `coupons` table in production. */
const PROMOS: (Promo & { active: boolean; expires?: string })[] = [
  { code: "WELCOME10", type: "percent", value: 10, description: "10% off your first order", active: true },
  { code: "TW500", type: "fixed", value: 500, minSubtotal: 4999, description: "₹500 off orders above ₹4,999", active: true },
  { code: "SIGNATURE15", type: "percent", value: 15, minSubtotal: 9999, description: "15% off orders above ₹9,999", active: true, expires: "2026-12-31" },
];

export function findPromo(code: string | undefined | null): Promo | null {
  if (!code) return null;
  const p = PROMOS.find((x) => x.code === code.trim().toUpperCase() && x.active);
  if (!p) return null;
  if (p.expires && new Date(p.expires) < new Date()) return null;
  const { active: _a, expires: _e, ...promo } = p;
  void _a;
  void _e;
  return promo;
}
