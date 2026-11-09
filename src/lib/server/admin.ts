import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@/lib/types";
import { products } from "@/data/products";
import { sign, verify } from "./auth";
import { availableStock, read, verifyPassword, type DB } from "./store";

/**
 * Admin sign-in, separate from customer accounts (/admin/login).
 *
 * - The owner signs in with ADMIN_EMAIL + ADMIN_PASSWORD from the environment and can do everything.
 * - The owner can add team members (Admin → Team) as a manager or support, each with their own password.
 * Signing in sets a short-lived, signed `tw_admin` cookie. Changing a password, the role or disabling someone ends
 * their sessions. Every change made in the admin is written to the activity log.
 */
export const ADMIN_COOKIE = "tw_admin";
const ADMIN_MAX_AGE = 60 * 60 * 12; // 12 hours

export type Role = "owner" | "manager" | "support";
export type Area = "dashboard" | "orders" | "returns" | "customers" | "inbox" | "reviews" | "products" | "content" | "offers" | "coupons" | "settings" | "team" | "activity";

export const ROLE_LABEL: Record<Role, string> = { owner: "Owner", manager: "Manager", support: "Support" };
export const ROLE_HINT: Record<Role, string> = {
  owner: "Everything, including adding and removing team members",
  manager: "Everything except managing the team",
  support: "Orders, returns, customers, inbox and reviews — no prices, products or settings",
};

const ACCESS: Record<Role, Area[] | "all"> = {
  owner: "all",
  manager: ["dashboard", "orders", "returns", "customers", "inbox", "reviews", "products", "content", "offers", "coupons", "settings", "activity"],
  support: ["dashboard", "orders", "returns", "customers", "inbox", "reviews"],
};

export type StaffMember = { id: string; name: string; email: string; role: Role; passwordHash: string; active: boolean; createdAt: string; lastLoginAt?: string };
export type AdminUser = { id: string; name: string; email: string; role: Role };
export type AuditEntry = { id: string; at: string; actor: { id: string; name: string; role: Role }; area: Area; action: string; href?: string };

export const can = (user: Pick<AdminUser, "role"> | null | undefined, area: Area) => {
  if (!user) return false;
  const a = ACCESS[user.role];
  return a === "all" || a.includes(area);
};

const sha = (s: string) => crypto.createHash("sha256").update(s).digest();
const stamp = (secretish: string) => sha(`tw-admin:${secretish}`).toString("base64url").slice(0, 16);

/** Env values as typed in a dashboard: forgive surrounding spaces, line breaks and quote marks. */
const envValue = (v: string | undefined) => (v ?? "").trim().replace(/^(["'])(.*)\1$/s, "$2").trim();

function owner() {
  const email = envValue(process.env.ADMIN_EMAIL).toLowerCase();
  const password = envValue(process.env.ADMIN_PASSWORD);
  return email && password ? { email, password } : null;
}

/** True when someone can sign in: the owner login from the environment, or an active login stored in the database. */
export const adminConfigured = async () => !!owner() || (await read((db) => !!db.staff?.some((m) => m.active)));
export const ownerEmail = () => owner()?.email ?? "";

/** Who is signing in, or null. Checks the owner login first, then active team members. */
export async function checkAdminLogin(email: string, password: string): Promise<AdminUser | null> {
  const o = owner();
  const e = email.trim().toLowerCase();
  if (o) {
    const okEmail = crypto.timingSafeEqual(sha(e), sha(o.email));
    const okPassword = crypto.timingSafeEqual(sha(password), sha(o.password));
    if (okEmail && okPassword) return { id: "owner", name: "Owner", email: o.email, role: "owner" };
  }
  const member = await read((db) => db.staff?.find((m) => m.email === e && m.active));
  if (member && verifyPassword(password, member.passwordHash)) return { id: member.id, name: member.name, email: member.email, role: member.role };
  return null;
}

/** What a session is tied to: changes when the password or role changes, so old sessions stop working. */
const sessionStamp = (user: AdminUser, member?: StaffMember) => (user.role === "owner" ? stamp(owner()!.password) : stamp(`${member!.passwordHash}|${member!.role}`));

export async function startAdminSession(user: AdminUser) {
  const member = user.role === "owner" ? undefined : await read((db) => db.staff?.find((m) => m.id === user.id));
  const token = sign({ kind: "admin", sub: user.id, v: sessionStamp(user, member), exp: Date.now() + ADMIN_MAX_AGE * 1000 });
  (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: ADMIN_MAX_AGE });
}

export async function endAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: 0 });
}

/** The signed-in admin user, or null. */
export async function getAdminSession(): Promise<AdminUser | null> {
  const s = verify<{ kind: string; sub: string; v: string }>((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!s || s.kind !== "admin") return null;
  if (s.sub === "owner") {
    const o = owner();
    if (!o) return null;
    const user: AdminUser = { id: "owner", name: "Owner", email: o.email, role: "owner" };
    return s.v === sessionStamp(user) ? user : null;
  }
  const member = await read((db) => db.staff?.find((m) => m.id === s.sub));
  if (!member || !member.active) return null;
  const user: AdminUser = { id: member.id, name: member.name, email: member.email, role: member.role };
  return s.v === sessionStamp(user, member) ? user : null;
}

/** For admin pages: not signed in → admin sign-in; signed in without access to this area → the overview. */
export async function getAdmin(area: Area = "dashboard") {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  if (!can(admin, area)) redirect(`/admin?denied=${area}`);
  return admin;
}

/** For server actions and route handlers: throws unless the caller may use this area. Never trust the page that called it. */
export async function assertAdmin(area: Area) {
  const admin = await getAdminSession();
  if (!admin || !can(admin, area)) throw new Error("Not authorised");
  return admin;
}

/* ─── Activity log ───────────────────────────────────────── */

const AUDIT_KEEP = 1000;

/** Record who changed what. Call inside the same write() as the change. */
export function log(db: DB, who: AdminUser, area: Area, action: string, href?: string) {
  const entry: AuditEntry = { id: `log_${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`, at: new Date().toISOString(), actor: { id: who.id, name: who.name, role: who.role }, area, action, ...(href ? { href } : {}) };
  db.audit = [entry, ...(db.audit ?? [])].slice(0, AUDIT_KEEP);
}

/* ─── Order workflow ─────────────────────────────────────── */

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "New",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

/** The happy path, in order. */
export const FLOW: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
export const OPEN_STATUSES: OrderStatus[] = ["placed", "confirmed", "packed"];

/** What an order can move to next from where it is now. */
export function nextStatuses(s: OrderStatus): OrderStatus[] {
  const i = FLOW.indexOf(s);
  const forward = i >= 0 && i < FLOW.length - 1 ? [FLOW[i + 1]] : [];
  if (OPEN_STATUSES.includes(s)) return [...forward, "cancelled"];
  if (s === "delivered") return ["returned"];
  return forward;
}

/* ─── Catalogue stock ────────────────────────────────────── */

export const LOW_STOCK = 3;

export function stockRows(db: DB) {
  return products.map((p) => {
    const variants = p.variants.map((v) => ({ ...v, available: availableStock(db, v.sku, v.stock) }));
    const total = variants.reduce((a, v) => a + v.available, 0);
    const low = variants.filter((v) => v.available > 0 && v.available <= LOW_STOCK).length;
    const out = variants.filter((v) => v.available === 0).length;
    return { product: p, variants, total, low, out };
  });
}

/* ─── Dashboard numbers ──────────────────────────────────── */

const DAY = 864e5;
const counted = (s: OrderStatus) => s !== "cancelled" && s !== "returned";

export function dashboard(db: DB) {
  const live = db.orders.filter((o) => counted(o.status));
  const revenue = live.reduce((a, o) => a + o.totals.total, 0);
  const since = (days: number) => Date.now() - days * DAY;

  // Sales per day for the last 14 days (oldest first).
  const days = Array.from({ length: 14 }, (_, i) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (13 - i));
    const end = start.getTime() + DAY;
    const total = live.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= start.getTime() && t < end;
    }).reduce((a, o) => a + o.totals.total, 0);
    return { date: start.toISOString(), total };
  });

  const units = new Map<string, { name: string; slug: string; units: number; revenue: number }>();
  for (const o of live)
    for (const i of o.items) {
      const u = units.get(i.productId) ?? { name: i.name, slug: i.slug, units: 0, revenue: 0 };
      u.units += i.quantity;
      u.revenue += i.lineTotal;
      units.set(i.productId, u);
    }

  const stock = stockRows(db);
  const lowVariants = stock
    .flatMap((r) => r.variants.filter((v) => v.available <= LOW_STOCK).map((v) => ({ product: r.product, ...v })))
    .sort((a, b) => a.available - b.available);

  return {
    revenue,
    orders: live.length,
    aov: live.length ? Math.round(revenue / live.length) : 0,
    revenue30: live.filter((o) => new Date(o.createdAt).getTime() >= since(30)).reduce((a, o) => a + o.totals.total, 0),
    toFulfil: db.orders.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    customers: db.users.length,
    newCustomers: db.users.filter((u) => new Date(u.createdAt).getTime() >= since(30)).length,
    openReturns: db.returns.filter((r) => r.status === "requested" || r.status === "approved" || r.status === "picked_up").length,
    newMessages: db.contactMessages.filter((m) => new Date(m.createdAt).getTime() >= since(7)).length,
    subscribers: db.newsletter.length,
    days,
    topProducts: [...units.values()].sort((a, b) => b.units - a.units).slice(0, 5),
    lowVariants,
    recentOrders: [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
  };
}

/** True once an optional end date has passed. */
export const hasEnded = (iso?: string) => !!iso && new Date(iso).getTime() < Date.now();

export const fmtDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) });
