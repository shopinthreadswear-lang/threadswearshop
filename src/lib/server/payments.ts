import "server-only";
import crypto from "crypto";

/**
 * Payment gateway abstraction.
 * - `sandbox`: simulated test gateway. Used in local development, or in production only when PAYMENT_PROVIDER=sandbox
 *   is set on purpose. Otherwise the live site takes no online payments (cash on delivery and gift cards only),
 *   so an order can never be marked paid without real money.
 * - `razorpay` / `stripe`: implement `createIntent` + `verify` with the official SDKs.
 *   Keys are read from env only — never shipped to the client except publishable ids.
 */
export type PaymentInput = {
  method: "upi" | "card" | "netbanking" | "wallet" | "cod" | "giftcard";
  amount: number; // INR
  orderId: string;
  details?: { cardNumber?: string; vpa?: string; bank?: string; wallet?: string };
};

export type PaymentResult = { ok: true; reference: string; status: "paid" | "cod" } | { ok: false; error: string };

interface Gateway {
  charge(input: PaymentInput): Promise<PaymentResult>;
}

const sandbox: Gateway = {
  async charge({ method, details }) {
    if (method === "cod") return { ok: true, reference: `cod_${crypto.randomBytes(5).toString("hex")}`, status: "cod" };
    // Test triggers: card ending 0002 or UPI "fail@upi" simulate a decline.
    const digits = details?.cardNumber?.replace(/\D/g, "") ?? "";
    if ((method === "card" && digits.endsWith("0002")) || details?.vpa === "fail@upi") {
      return { ok: false, error: "Your payment could not be completed. No amount has been debited — please try another method." };
    }
    return { ok: true, reference: `pay_${crypto.randomBytes(7).toString("base64url")}`, status: "paid" };
  },
};

const razorpay: Gateway = {
  async charge() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return { ok: false, error: "Payments are temporarily unavailable." };
    // 1. Create a Razorpay order server-side (POST /v1/orders) with amount in paise.
    // 2. Return order_id to client to open Checkout; 3. verify razorpay_signature via HMAC-SHA256 in a webhook.
    return { ok: false, error: "Razorpay integration pending configuration." };
  },
};

const stripe: Gateway = {
  async charge() {
    if (!process.env.STRIPE_SECRET_KEY) return { ok: false, error: "Payments are temporarily unavailable." };
    // Create a PaymentIntent server-side; confirm on client with Stripe Elements; fulfil on `payment_intent.succeeded` webhook.
    return { ok: false, error: "Stripe integration pending configuration." };
  },
};

/** Card / UPI / net banking / wallets can be offered at checkout. */
export function onlinePaymentsEnabled() {
  const p = process.env.PAYMENT_PROVIDER;
  if (p === "razorpay") return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  if (p === "stripe") return !!process.env.STRIPE_SECRET_KEY;
  return p === "sandbox" || process.env.NODE_ENV !== "production";
}

const offline: Gateway = {
  async charge({ method }) {
    if (method === "cod") return { ok: true, reference: `cod_${crypto.randomBytes(5).toString("hex")}`, status: "cod" };
    return { ok: false, error: "Online payment isn’t available yet. Please choose Cash on Delivery." };
  },
};

export function gateway(): Gateway {
  if (!process.env.PAYMENT_PROVIDER && process.env.NODE_ENV === "production") return offline;
  switch (process.env.PAYMENT_PROVIDER) {
    case "razorpay":
      return razorpay;
    case "stripe":
      return stripe;
    default:
      return sandbox;
  }
}
