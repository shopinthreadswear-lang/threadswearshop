import "server-only";
import { promises as fs, readFileSync } from "fs";
import path from "path";
import crypto from "crypto";
import type { Order, ReturnRequest, Review, User } from "@/lib/types";
import { applyCatalog, type CatalogState } from "@/lib/catalog";
import type { Coupon } from "./promos";
import type { AuditEntry, StaffMember } from "./admin";
import { supabaseEnabled, supabaseLoad, supabaseWrite } from "./supabase-store";

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
  /** Admin edits to products, offers and store settings. */
  catalog?: CatalogState;
  /** Discount codes. Seeded from the defaults in promos.ts on first use. */
  coupons?: Coupon[];
  /** Admin team members (the owner signs in from environment variables). */
  staff?: StaffMember[];
  /** Who changed what in the admin, newest first. */
  audit?: AuditEntry[];
};

const DATA_DIR = process.env.VERCEL ? "/tmp/threads-wear" : path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "store.json");

/**
 * Where data lives:
 * - Supabase, when SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) and the project URL are set — see supabase/schema.sql.
 * - Otherwise a JSON file in `.data/` (zero-config local development).
 */
export const storeBackend = () => (supabaseEnabled() ? "supabase" : "file");

let cache: DB | null = null;
let queue: Promise<unknown> = Promise.resolve();

// Apply the admin's catalogue edits as soon as the server starts, before any page renders (file mode).
if (!supabaseEnabled()) {
  try {
    applyCatalog((JSON.parse(readFileSync(FILE, "utf8")) as DB).catalog);
  } catch {
    /* no store yet: the code catalogue is used as-is */
  }
}

const empty = (): DB => ({ users: [], orders: [], reviews: [], returns: [], newsletter: [], stockAlerts: [], contactMessages: [], resetTokens: [], giftCards: [], inventoryAdjustments: {} });

/** First data for a brand-new Supabase database: your local store if there is one, otherwise the demo data. */
async function startingData(): Promise<DB> {
  if (!process.env.VERCEL) {
    try {
      return { ...empty(), ...(JSON.parse(await fs.readFile(FILE, "utf8")) as DB) };
    } catch {
      /* no local file */
    }
  }
  return seed();
}

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

/** A brand-new store: no customers, orders or gift cards. Products come from the catalogue in code. */
function seed(): DB {
  return empty();
}

let cacheMtime = 0;

/**
 * API routes and pages are built as separate server bundles, each with its own copy of this module. So the
 * in-memory copy is only trusted while the file on disk is unchanged; if another bundle has saved since, re-read it.
 */
async function load(): Promise<DB> {
  if (supabaseEnabled()) {
    const db = await supabaseLoad(empty, startingData);
    applyCatalog(db.catalog);
    return db;
  }
  try {
    const { mtimeMs } = await fs.stat(FILE);
    if (!cache || mtimeMs !== cacheMtime) {
      cache = JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
      cacheMtime = mtimeMs;
    }
  } catch {
    if (!cache) {
      cache = seed();
      await persist(cache);
    }
  }
  applyCatalog(cache!.catalog);
  return cache!;
}

async function persist(db: DB) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, FILE);
    cacheMtime = (await fs.stat(FILE)).mtimeMs;
  } catch (e) {
    console.error("[store] persist failed", e);
  }
}

/** Make sure the shared catalogue reflects the latest admin edits before a page reads it. */
export async function syncCatalog() {
  await load();
}

export async function read<T>(fn: (db: DB) => T): Promise<T> {
  const db = await load();
  return fn(db);
}

/** Serialised write transaction — prevents lost updates under concurrent requests. */
export function write<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  if (supabaseEnabled()) {
    const run = queue.then(() => supabaseWrite(empty, startingData, fn, (db) => applyCatalog(db.catalog)));
    queue = run.catch(() => undefined);
    return run;
  }
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    applyCatalog(db.catalog);
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

