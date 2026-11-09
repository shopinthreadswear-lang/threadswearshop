import "server-only";
import { redirect } from "next/navigation";
import type { OrderStatus, PublicUser } from "@/lib/types";
import { products } from "@/data/products";
import { getCurrentUser } from "./auth";
import { availableStock, type DB } from "./store";

/**
 * Who can open /admin. Set ADMIN_EMAILS to a comma-separated list in production.
 * In development only, the demo account is an admin when the list is empty, so the dashboard can be tried out.
 */
function adminEmails() {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!list.length && process.env.NODE_ENV !== "production") return ["arjun@threadsware.in"];
  return list;
}

export const isAdmin = (user: Pick<PublicUser, "email"> | null | undefined) => !!user && adminEmails().includes(user.email.toLowerCase());

/** For admin pages: signed-out visitors go to sign-in; signed-in non-admins get `null` (the layout shows "no access"). */
export async function getAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/admin");
  return isAdmin(user) ? user : null;
}

/** For server actions and route handlers: throws unless the caller is an admin. Never trust the page that called it. */
export async function assertAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) throw new Error("Not authorised");
  return user!;
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
