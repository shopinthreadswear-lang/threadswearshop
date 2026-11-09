import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Order, ReturnRequest, Review, User } from "@/lib/types";
import { getProduct } from "@/data/products";

/**
 * Persistence layer.
 *
 * Local / demo: a JSON document in `.data/store.json` (zero-config, survives restarts).
 * Production: implement the same `Repository` surface against Supabase/PostgreSQL —
 * the schema lives in `supabase/schema.sql` and maps 1:1 to these collections.
 */
export type DB = {
  users: User[];
  orders: Order[];
  reviews: Review[];
  returns: ReturnRequest[];
  newsletter: { email: string; source: string; createdAt: string }[];
  stockAlerts: { productId: string; color: string; size: string; contact: string; createdAt: string }[];
  contactMessages: { id: string; name: string; email: string; phone?: string; orderNumber?: string; topic: string; message: string; createdAt: string }[];
  resetTokens: { tokenHash: string; userId: string; expiresAt: string }[];
  giftCards: { code: string; balance: number; initial: number; recipientEmail: string; createdAt: string }[];
  /** Units sold per SKU — subtracted from catalogue stock. */
  inventoryAdjustments: Record<string, number>;
};

const DATA_DIR = process.env.VERCEL ? "/tmp/threads-ware" : path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "store.json");

let cache: DB | null = null;
let queue: Promise<unknown> = Promise.resolve();

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected);
}

export const newId = (prefix: string) => `${prefix}_${crypto.randomBytes(8).toString("hex")}`;

const daysFromNow = (d: number) => new Date(Date.now() + d * 864e5).toISOString();

function orderItem(slug: string, color: string, size: string, quantity = 1) {
  const p = getProduct(slug)!;
  const v = p.variants.find((x) => x.color === color && x.size === size)!;
  return { productId: p.id, slug: p.slug, name: p.name, image: p.images[0], color, size, quantity, unitPrice: p.price, lineTotal: p.price * quantity, sku: v.sku };
}

function seed(): DB {
  const addr = { fullName: "Arjun Kapoor", phone: "9820012345", line1: "B-1204, Lodha Altamount", line2: "Altamount Road", city: "Mumbai", state: "Maharashtra", pincode: "400026", country: "India" };
  const u: User = {
    id: "usr_demo_arjun",
    firstName: "Arjun",
    lastName: "Kapoor",
    email: "arjun@threadsware.in",
    phone: "9820012345",
    dob: "1994-03-18",
    passwordHash: hashPassword("Threads@2026"),
    createdAt: daysFromNow(-240),
    addresses: [
      { id: "adr_home", label: "Home", isDefault: true, ...addr },
      { id: "adr_work", label: "Studio", fullName: "Arjun Kapoor", phone: "9820012345", line1: "Unit 7, One BKC", line2: "Bandra Kurla Complex", city: "Mumbai", state: "Maharashtra", pincode: "400051", country: "India" },
    ],
    payments: [
      { id: "pm_card", type: "card", brand: "Visa", last4: "4242", expiry: "08/29", holder: "ARJUN KAPOOR", isDefault: true },
      { id: "pm_upi", type: "upi", vpa: "arjun.k@okhdfc" },
    ],
    wishlist: ["p_021", "p_027", "p_033", "p_014"],
    preferences: { newsletter: true, sms: true, whatsapp: true, preferredSize: "M", preferredFit: "Regular" },
  };

  const delivered: Order = {
    id: "TW-482913",
    accessToken: crypto.randomBytes(12).toString("hex"),
    userId: u.id,
    email: u.email,
    phone: u.phone!,
    items: [orderItem("mercer-heavyweight-tee", "Onyx Black", "M", 2), orderItem("kensington-oxford-shirt", "Optic White", "M")],
    shippingAddress: addr,
    delivery: { method: "standard", label: "Standard Delivery", eta: "2–4 working days" },
    payment: { method: "upi", label: "UPI · arjun.k@okhdfc", status: "paid", reference: "pay_Qx81Lm2Tz" },
    totals: { subtotal: 8497, discount: 0, shipping: 0, codFee: 0, tax: 910, total: 8497 },
    status: "delivered",
    timeline: [
      { status: "placed", at: daysFromNow(-12) },
      { status: "confirmed", at: daysFromNow(-12) },
      { status: "packed", at: daysFromNow(-11) },
      { status: "shipped", at: daysFromNow(-11), note: "Dispatched from Mumbai studio" },
      { status: "out_for_delivery", at: daysFromNow(-9) },
      { status: "delivered", at: daysFromNow(-9), note: "Received by Arjun" },
    ],
    courier: { name: "Blue Dart", trackingId: "BD5521098734IN" },
    expectedDelivery: daysFromNow(-9),
    createdAt: daysFromNow(-12),
  };

  const inTransit: Order = {
    id: "TW-517406",
    accessToken: crypto.randomBytes(12).toString("hex"),
    userId: u.id,
    email: u.email,
    phone: u.phone!,
    items: [orderItem("mayfair-suede-jacket", "Tobacco", "M"), orderItem("regent-knitted-polo", "Tobacco", "M")],
    shippingAddress: addr,
    delivery: { method: "express", label: "Express Delivery", eta: "1–2 working days" },
    payment: { method: "card", label: "Visa ending 4242", status: "paid", reference: "pay_R2b0Kc7Vn" },
    totals: { subtotal: 16998, discount: 0, shipping: 349, codFee: 0, tax: 1821, total: 17347 },
    status: "shipped",
    timeline: [
      { status: "placed", at: daysFromNow(-2) },
      { status: "confirmed", at: daysFromNow(-2) },
      { status: "packed", at: daysFromNow(-1.5), note: "Quality checked & packed" },
      { status: "shipped", at: daysFromNow(-1), note: "In transit — Mumbai hub" },
    ],
    courier: { name: "Delhivery", trackingId: "DL7781203945" },
    expectedDelivery: daysFromNow(1),
    createdAt: daysFromNow(-2),
  };

  return {
    users: [u],
    orders: [inTransit, delivered],
    reviews: [],
    returns: [],
    newsletter: [],
    stockAlerts: [],
    contactMessages: [],
    resetTokens: [],
    giftCards: [{ code: "TWGC-DEMO-2026", balance: 5000, initial: 5000, recipientEmail: u.email, createdAt: daysFromNow(-30) }],
    inventoryAdjustments: {},
  };
}

async function load(): Promise<DB> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
  } catch {
    cache = seed();
    await persist(cache);
  }
  return cache!;
}

async function persist(db: DB) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, FILE);
  } catch (e) {
    console.error("[store] persist failed", e);
  }
}

export async function read<T>(fn: (db: DB) => T): Promise<T> {
  const db = await load();
  return fn(db);
}

/** Serialised write transaction — prevents lost updates under concurrent requests. */
export function write<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await persist(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export function availableStock(db: DB, sku: string, base: number) {
  return Math.max(0, base - (db.inventoryAdjustments[sku] ?? 0));
}

export function generateOrderId(db: DB) {
  let id: string;
  do id = `TW-${crypto.randomInt(100000, 999999)}`;
  while (db.orders.some((o) => o.id === id));
  return id;
}

