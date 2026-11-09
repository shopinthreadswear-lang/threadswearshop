import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DB } from "./store";

/**
 * Supabase backend for the store (see supabase/schema.sql).
 *
 * The app works with one in-memory `DB` object. This module loads it from the Supabase tables, and on each write
 * sends only the rows that changed, through `tw_apply`, which applies them in one transaction and bumps a version.
 * Before every read the server checks that version (one tiny query, shared by concurrent reads), so a change saved
 * by another server instance is never missed. A write that loses a race gets `version_conflict`, reloads and retries.
 */

type Row = { key: string; data: unknown };
type Spec = { table: string; toRows: (db: DB) => Row[]; fromRows: (rows: Row[], db: DB) => void; order?: (a: Row, b: Row) => number };

const byField = (field: string, dir: 1 | -1) => (a: Row, b: Row) => {
  const x = String((a.data as Record<string, unknown>)[field] ?? "");
  const y = String((b.data as Record<string, unknown>)[field] ?? "");
  return x < y ? -dir : x > y ? dir : 0;
};

const list = <K extends keyof DB>(name: K, table: string, key: (x: NonNullable<DB[K]> extends (infer T)[] ? T : never) => string, order?: Spec["order"]): Spec => ({
  table,
  order,
  toRows: (db) => ((db[name] ?? []) as unknown[]).map((x) => ({ key: key(x as never), data: x })),
  fromRows: (rows, db) => {
    (db as Record<string, unknown>)[name] = rows.map((r) => r.data);
  },
});

const SPECS: Spec[] = [
  list("users", "customers", (u) => u.id, byField("createdAt", 1)),
  list("orders", "orders", (o) => o.id, byField("createdAt", -1)),
  list("reviews", "reviews", (r) => r.id, byField("date", -1)),
  list("returns", "returns", (r) => r.id, byField("createdAt", 1)),
  list("newsletter", "newsletter_subscribers", (n) => n.email.toLowerCase(), byField("createdAt", 1)),
  list("stockAlerts", "stock_alerts", (a) => `${a.productId}|${a.color}|${a.size}|${a.contact}`, byField("createdAt", 1)),
  list("contactMessages", "contact_messages", (m) => m.id, byField("createdAt", 1)),
  list("resetTokens", "password_resets", (t) => t.tokenHash),
  list("giftCards", "gift_cards", (g) => g.code, byField("createdAt", 1)),
  list("coupons", "coupons", (c) => c.id, byField("createdAt", -1)),
  {
    table: "inventory",
    toRows: (db) => Object.entries(db.inventoryAdjustments).map(([sku, sold]) => ({ key: sku, data: { sold } })),
    fromRows: (rows, db) => {
      db.inventoryAdjustments = Object.fromEntries(rows.map((r) => [r.key, (r.data as { sold: number }).sold]));
    },
  },
  {
    table: "store_settings",
    toRows: (db) => (db.catalog ? [{ key: "catalog", data: db.catalog }] : []),
    fromRows: (rows, db) => {
      db.catalog = (rows.find((r) => r.key === "catalog")?.data as DB["catalog"]) ?? undefined;
    },
  },
];

const url = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Supabase is used when the project URL and the server-only secret key are both set. */
export const supabaseEnabled = () => !!(url() && secret());

type State = { client?: SupabaseClient; db: DB | null; version: number; snapshot: Map<string, Map<string, string>>; checking: Promise<number> | null; checkedAt: number };
// Shared by every server bundle in the process (API routes and pages are bundled separately).
const g = globalThis as unknown as { __twSupabase?: State };
const S: State = (g.__twSupabase ??= { db: null, version: -1, snapshot: new Map(), checking: null, checkedAt: 0 });

function client() {
  return (S.client ??= createClient(url()!, secret()!, { auth: { persistSession: false, autoRefreshToken: false } }));
}

async function remoteVersion(): Promise<number> {
  // Concurrent reads within one request share a single check.
  if (S.checking && Date.now() - S.checkedAt < 250) return S.checking;
  S.checkedAt = Date.now();
  S.checking = (async () => {
    const { data, error } = await client().from("tw_meta").select("version").eq("id", 1).single();
    if (error) throw new Error(`[store] Supabase version check failed: ${error.message}`);
    return Number(data.version);
  })();
  return S.checking;
}

async function fetchAll(table: string): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client().from(table).select("key,data").order("key").range(from, from + 999);
    if (error) throw new Error(`[store] Supabase read of ${table} failed: ${error.message}`);
    out.push(...(data as Row[]));
    if (!data || data.length < 1000) return out;
  }
}

function takeSnapshot(db: DB) {
  return new Map(SPECS.map((s) => [s.table, new Map(s.toRows(db).map((r) => [r.key, JSON.stringify(r.data)]))]));
}

async function reload(empty: () => DB, version: number) {
  const tables = await Promise.all(SPECS.map((s) => fetchAll(s.table)));
  const db = empty();
  SPECS.forEach((s, i) => s.fromRows(s.order ? [...tables[i]].sort(s.order) : tables[i], db));
  S.db = db;
  S.version = version;
  S.snapshot = takeSnapshot(db);
}

/** The current DB, re-read from Supabase if anyone has saved since we last looked. */
export async function supabaseLoad(empty: () => DB, seed: () => Promise<DB>): Promise<DB> {
  const v = await remoteVersion();
  if (v === 0 && S.version !== 0) {
    // Brand-new database: fill it once with the starting data.
    try {
      await apply(0, diff(new Map(), await seed()));
    } catch (e) {
      if (!String(e).includes("version_conflict")) throw e; // another server seeded it first — fine
    }
    S.checking = null;
    return supabaseLoad(empty, seed);
  }
  if (!S.db || v !== S.version) await reload(empty, v);
  return S.db!;
}

function diff(before: Map<string, Map<string, string>>, db: DB) {
  const changes: Record<string, { upsert?: Row[]; delete?: string[] }> = {};
  for (const s of SPECS) {
    const prev = before.get(s.table) ?? new Map<string, string>();
    const rows = s.toRows(db);
    const seen = new Set<string>();
    const upsert: Row[] = [];
    for (const r of rows) {
      seen.add(r.key);
      if (prev.get(r.key) !== JSON.stringify(r.data)) upsert.push(r);
    }
    const del = [...prev.keys()].filter((k) => !seen.has(k));
    if (upsert.length || del.length) changes[s.table] = { ...(upsert.length ? { upsert } : {}), ...(del.length ? { delete: del } : {}) };
  }
  return changes;
}

async function apply(expected: number, changes: Record<string, unknown>) {
  const { data, error } = await client().rpc("tw_apply", { expected, changes });
  if (error) throw new Error(error.message.includes("version_conflict") ? "version_conflict" : `[store] Supabase save failed: ${error.message}`);
  return Number(data);
}

/** Run a change against the latest data and save only what it touched. Retries if another server saved first. */
export async function supabaseWrite<T>(empty: () => DB, seed: () => Promise<DB>, fn: (db: DB) => T | Promise<T>, after: (db: DB) => void): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    await supabaseLoad(empty, seed);
    const db = structuredClone(S.db!);
    const result = await fn(db);
    const changes = diff(S.snapshot, db);
    if (!Object.keys(changes).length) return result;
    try {
      const version = await apply(S.version, changes);
      S.db = db;
      S.version = version;
      S.snapshot = takeSnapshot(db);
      S.checking = null;
      after(db);
      return result;
    } catch (e) {
      if (String(e).includes("version_conflict") && attempt < 4) {
        S.checking = null;
        continue;
      }
      throw e;
    }
  }
}
