"use client";

/**
 * Vendor-neutral analytics bus. Every commerce event goes through `track()`,
 * which pushes GA4-shaped events to `dataLayer` (GTM / GA4) and mirrors key
 * events to Meta Pixel. Scripts are only injected after cookie consent.
 */
type Item = { item_id: string; item_name: string; price: number; quantity?: number; item_variant?: string; item_category?: string };

export type AnalyticsEvent =
  | { name: "view_item"; items: Item[]; value: number }
  | { name: "view_item_list"; list: string; items: Item[] }
  | { name: "add_to_cart"; items: Item[]; value: number }
  | { name: "remove_from_cart"; items: Item[]; value: number }
  | { name: "add_to_wishlist"; items: Item[]; value: number }
  | { name: "view_cart"; items: Item[]; value: number }
  | { name: "begin_checkout"; items: Item[]; value: number; coupon?: string }
  | { name: "add_shipping_info"; value: number; shipping_tier: string }
  | { name: "add_payment_info"; value: number; payment_type: string }
  | { name: "purchase"; transaction_id: string; value: number; items: Item[]; coupon?: string; shipping?: number; tax?: number }
  | { name: "search"; search_term: string }
  | { name: "sign_up" | "login" }
  | { name: "newsletter_signup"; source: string }
  | { name: "cart_abandon_snapshot"; value: number; items: Item[] };

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

const META_MAP: Partial<Record<AnalyticsEvent["name"], string>> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  add_to_wishlist: "AddToWishlist",
  begin_checkout: "InitiateCheckout",
  add_payment_info: "AddPaymentInfo",
  purchase: "Purchase",
  search: "Search",
  sign_up: "CompleteRegistration",
  newsletter_signup: "Lead",
};

export function track(e: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  const { name, ...params } = e as { name: string } & Record<string, unknown>;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ecommerce: { currency: "INR", ...params } });
  const meta = META_MAP[e.name];
  if (meta && window.fbq) window.fbq("track", meta, { currency: "INR", value: (params as { value?: number }).value });
  if (process.env.NODE_ENV === "development") console.debug("[analytics]", name, params);
}
