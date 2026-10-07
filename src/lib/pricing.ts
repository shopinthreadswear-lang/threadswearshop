import { commerce } from "./site";

export type Promo = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
  description: string;
};

export type DeliveryMethod = "standard" | "express";

export const deliveryOptions: Record<DeliveryMethod, { label: string; eta: string; price: (subtotal: number) => number }> = {
  standard: {
    label: "Standard Delivery",
    eta: "2–4 working days (metro) · 4–7 elsewhere",
    price: (s) => (s >= commerce.freeShippingThreshold ? 0 : commerce.standardShipping),
  },
  express: {
    label: "Express Delivery",
    eta: "1–2 working days · select metro pin codes",
    price: () => commerce.expressShipping,
  },
};

export function promoDiscount(subtotal: number, promo?: Promo | null) {
  if (!promo) return 0;
  if (promo.minSubtotal && subtotal < promo.minSubtotal) return 0;
  const d = promo.type === "percent" ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return Math.min(d, subtotal);
}

/** Single source of truth for order maths — run on client for display and on server for verification. */
export function computeTotals(opts: {
  subtotal: number;
  promo?: Promo | null;
  delivery?: DeliveryMethod;
  cod?: boolean;
  giftCardOnly?: boolean;
}) {
  const { subtotal, promo, delivery = "standard", cod = false, giftCardOnly = false } = opts;
  const discount = promoDiscount(subtotal, promo);
  const shipping = giftCardOnly || subtotal === 0 ? 0 : deliveryOptions[delivery].price(subtotal);
  const codFee = cod ? commerce.codFee : 0;
  const total = Math.max(0, subtotal - discount + shipping + codFee);
  // GST is included in prices — expose the component for the invoice.
  const tax = Math.round(((subtotal - discount) * commerce.gstRate) / (1 + commerce.gstRate));
  const remainingForFreeShipping = Math.max(0, commerce.freeShippingThreshold - subtotal);
  return { subtotal, discount, shipping, codFee, tax, total, remainingForFreeShipping };
}
