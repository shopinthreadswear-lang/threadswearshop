"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { z } from "zod";
import type { Badge, OrderStatus, ReturnRequest, Size } from "@/lib/types";
import { baseProduct, buildCustomProduct, currentHome, deriveProducts, emptyCatalog, type CustomProductInput, type StoreSettings } from "@/lib/catalog";
import { mediaEnabled, MEDIA_MAX_BYTES, MEDIA_TYPES, signUpload } from "@/lib/server/media";
import { categories } from "@/data/categories";
import { getProductById } from "@/data/products";
import { csvObjects } from "@/lib/csv";
import { assertAdmin, log, nextStatuses, ownerEmail, ROLE_LABEL, STATUS_LABEL } from "@/lib/server/admin";
import { coupons } from "@/lib/server/promos";
import { hashPassword, write, type DB } from "@/lib/server/store";

export type ActionState = { ok: boolean; message: string; fields?: Record<string, string> } | null;

const done = (message: string): ActionState => ({ ok: true, message });
const oops = (message: string, fields?: Record<string, string>): ActionState => ({ ok: false, message, fields });
const GIFT_CARD = "gift-card";
const catalog = (db: DB) => (db.catalog ??= emptyCatalog());
const id = (prefix: string) => `${prefix}_${crypto.randomBytes(5).toString("hex")}`;

/** Everything the shop shows can change, so refresh every page. */
const refreshStore = () => revalidatePath("/", "layout");

function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const i of error.issues) fields[i.path.join(".")] ??= i.message;
  return fields;
}

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const optionalNumber = z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), z.coerce.number().int().min(0).optional());
const price = z.coerce.number({ error: "Enter a price" }).int("Use whole rupees").min(1, "Price must be at least ₹1").max(500000, "That price looks too high");

/* ─── Orders ─────────────────────────────────────────────── */

export async function updateOrderStatus(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("orders");
  const parsed = z
    .object({
      orderId: z.string().min(1),
      status: z.enum(["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"]),
      note: z.string().trim().max(200).optional(),
      courierName: z.string().trim().max(60).optional(),
      trackingId: z.string().trim().max(60).optional(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Something in that form doesn’t look right. Please check and try again.");
  const { orderId, status, note, courierName, trackingId } = parsed.data;
  if (status === "shipped" && (!courierName || !trackingId)) return oops("Add the courier and tracking number before marking this order shipped.", { courierName: !courierName ? "Required to ship" : "", trackingId: !trackingId ? "Required to ship" : "" });

  const result = await write((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return oops("We couldn’t find that order. It may have been removed.");
    if (!nextStatuses(order.status).includes(status as OrderStatus))
      return oops(`This order is ${STATUS_LABEL[order.status].toLowerCase()} and can’t move to “${STATUS_LABEL[status as OrderStatus]}”. Refresh to see the latest.`);
    order.status = status as OrderStatus;
    order.timeline.push({ status: status as OrderStatus, at: new Date().toISOString(), ...(note ? { note } : {}) });
    if (courierName && trackingId) order.courier = { name: courierName, trackingId };
    if (status === "delivered") order.expectedDelivery = new Date().toISOString();
    if (status === "cancelled")
      for (const i of order.items) if (i.productId !== GIFT_CARD && db.inventoryAdjustments[i.sku]) db.inventoryAdjustments[i.sku] -= i.quantity;
    log(db, me, "orders", `Order ${order.id} marked ${STATUS_LABEL[status as OrderStatus].toLowerCase()}${trackingId ? ` · ${courierName} ${trackingId}` : ""}`, `/admin/orders/${order.id}`);
    return done(status === "cancelled" ? "Order cancelled and the stock put back." : `Order marked ${STATUS_LABEL[status as OrderStatus].toLowerCase()}.`);
  });
  revalidatePath("/admin", "layout");
  return result;
}

/* ─── Products ───────────────────────────────────────────── */

const BADGES = ["auto", "none", "New", "Bestseller", "Limited Edition", "Sale"] as const;

export async function saveProduct(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("products");
  const parsed = z
    .object({
      productId: z.string().min(1),
      name: z.string().trim().min(2, "Give the product a name").max(90),
      shortDescription: z.string().trim().min(5, "Add a one-line description").max(200),
      description: z.string().trim().min(10, "Add a fuller description").max(2000),
      price,
      compareAtPrice: optionalNumber,
      badge: z.enum(BADGES),
      isNew: checkbox,
      isBestSeller: checkbox,
      hidden: checkbox,
      seoTitle: z.string().trim().max(70, "Search engines show about 60 characters").optional(),
      seoDescription: z.string().trim().max(170, "Search engines show about 155 characters").optional(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  if (d.compareAtPrice && d.compareAtPrice <= d.price) return oops("The original price must be higher than the selling price.", { compareAtPrice: "Must be more than the price" });

  const result = await write((db) => {
    const c = catalog(db);
    const custom = c.custom.find((x) => x.id === d.productId);
    const base = baseProduct(d.productId);
    if (!custom && !base) return oops("That product no longer exists.");
    if (custom) {
      Object.assign(custom, { name: d.name, shortDescription: d.shortDescription, description: d.description, price: d.price, compareAtPrice: d.compareAtPrice || undefined, isNew: d.isNew });
    }
    const prev = c.products[d.productId] ?? {};
    c.products[d.productId] = {
      ...prev,
      ...(custom ? {} : { name: d.name, shortDescription: d.shortDescription, description: d.description, price: d.price, compareAtPrice: d.compareAtPrice ?? null, isNew: d.isNew }),
      isBestSeller: d.isBestSeller,
      badge: d.badge as Badge | "auto" | "none",
      hidden: d.hidden,
      seoTitle: d.seoTitle || undefined,
      seoDescription: d.seoDescription || undefined,
    };
    log(db, me, "products", `Edited ${d.name} (₹${d.price}${d.hidden ? ", hidden" : ""})`, `/admin/products/${d.productId}`);
    return done(d.hidden ? "Saved. This product is hidden from the shop." : "Saved. The shop is showing the new details.");
  });
  refreshStore();
  return result;
}

/** Set the units on hand for one colour and size. Sales after this count down from the new number. */
export async function setStock(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("products");
  const parsed = z.object({ productId: z.string().min(1), sku: z.string().min(1), qty: z.coerce.number().int().min(0, "Can’t be below 0").max(9999) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Enter a whole number of units, 0 or more.");
  const { productId, sku, qty } = parsed.data;
  const result = await write((db) => {
    const c = catalog(db);
    const custom = c.custom.find((x) => x.id === productId);
    const variant = (custom ? buildCustomProduct(custom) : baseProduct(productId))?.variants.find((v) => v.sku === sku);
    if (!variant) return oops("That size is no longer in the catalogue.");
    const patch = (c.products[productId] ??= {});
    patch.stock = { ...patch.stock, [sku]: qty };
    db.inventoryAdjustments[sku] = 0;
    log(db, me, "products", `Stock for ${sku} set to ${qty}`, `/admin/products/${productId}`);
    return done(`${variant.color} · ${variant.size}: ${qty} in stock.`);
  });
  refreshStore();
  return result;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "46"] as const;

export async function createProduct(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("products");
  const raw = Object.fromEntries(form);
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Give the product a name").max(90),
      category: z.enum(categories.map((c) => c.slug) as [string, ...string[]], { error: "Choose a category" }),
      subcategory: z.string().trim().min(2, "Choose or type a product type").max(60),
      price,
      compareAtPrice: optionalNumber,
      shortDescription: z.string().trim().min(5, "Add a one-line description").max(200),
      description: z.string().trim().min(10, "Add a fuller description").max(2000),
      images: z.array(z.string().trim().regex(/^(https:\/\/|\/)\S+$/, "Each photo needs a full https:// link")).min(1, "Add at least one photo").max(10),
      colors: z
        .string()
        .transform((s) =>
          s
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => {
              const [name, hex] = l.split(/\s*[,|]\s*/);
              return { name: (name ?? "").trim(), hex: (hex ?? "#2a1a14").trim() };
            }),
        )
        .pipe(z.array(z.object({ name: z.string().min(1).max(30), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colours need a hex code like #1f2a44") })).min(1, "Add at least one colour").max(8)),
      sizes: z.array(z.enum(SIZES)).min(1, "Pick at least one size"),
      stock: z.coerce.number().int().min(0).max(9999),
      fit: z.enum(["Slim", "Regular", "Relaxed", "Oversized", "Tailored", "One Size"]),
      materials: z.string().trim().min(2, "Say what it’s made of").max(120),
      isNew: checkbox,
    })
    .safeParse({ ...raw, sizes: form.getAll("sizes"), images: form.getAll("images").map(String).filter(Boolean) });
  if (!parsed.success) return oops("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  if (d.compareAtPrice && d.compareAtPrice <= d.price) return oops("The original price must be higher than the selling price.", { compareAtPrice: "Must be more than the price" });

  const newId = await write((db) => {
    const c = catalog(db);
    const base = d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "product";
    const taken = new Set(deriveProducts(c, { includeHidden: true }).map((p) => p.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    const input: CustomProductInput = {
      id: id("p_c"),
      slug,
      name: d.name,
      category: d.category,
      subcategory: d.subcategory,
      price: d.price,
      compareAtPrice: d.compareAtPrice || undefined,
      shortDescription: d.shortDescription,
      description: d.description,
      images: d.images,
      colors: d.colors,
      sizes: d.sizes as Size[],
      stock: d.stock,
      fit: d.fit,
      materials: d.materials,
      isNew: d.isNew,
      createdAt: new Date().toISOString(),
    };
    log(db, me, "products", `Added product ${d.name}`, `/admin/products/${input.id}`);
    c.custom.push(input);
    return input.id;
  });
  refreshStore();
  redirect(`/admin/products/${newId}?created=1`);
}

export async function deleteCustomProduct(form: FormData) {
  const me = await assertAdmin("products");
  const productId = String(form.get("productId") ?? "");
  await write((db) => {
    const c = catalog(db);
    log(db, me, "products", `Deleted product ${c.custom.find((x) => x.id === productId)?.name ?? productId}`);
    c.custom = c.custom.filter((x) => x.id !== productId);
    delete c.products[productId];
  });
  refreshStore();
  redirect("/admin/products?deleted=1");
}

/** Undo every admin edit to a code-catalogue product. */
export async function resetProduct(form: FormData) {
  const me = await assertAdmin("products");
  const productId = String(form.get("productId") ?? "");
  await write((db) => {
    log(db, me, "products", `Undid all edits to ${baseProduct(productId)?.name ?? productId}`, `/admin/products/${productId}`);
    delete catalog(db).products[productId];
  });
  refreshStore();
  redirect(`/admin/products/${productId}?reset=1`);
}

/* ─── Offers ─────────────────────────────────────────────── */

export async function saveOffer(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("offers");
  const parsed = z
    .object({
      offerId: z.string().optional(),
      name: z.string().trim().min(2, "Name the offer").max(60),
      percent: z.coerce.number().int("Use a whole number").min(1, "At least 1%").max(90, "At most 90%"),
      scope: z.string().regex(/^(all|cat:[a-z-]+|col:[a-z-]+)$/, "Choose what it applies to"),
      endsAt: z.string().optional(),
      active: checkbox,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  const result = await write((db) => {
    const c = catalog(db);
    const existing = d.offerId ? c.offers.find((o) => o.id === d.offerId) : undefined;
    const value = { name: d.name, percent: d.percent, scope: d.scope, active: d.active, endsAt: d.endsAt || undefined };
    if (existing) Object.assign(existing, value);
    else c.offers.push({ id: id("off"), ...value });
    log(db, me, "offers", `${existing ? "Updated" : "Created"} offer ${d.name} (${d.percent}% off${d.active ? "" : ", off"})`, "/admin/offers");
    return done(existing ? "Offer updated." : d.active ? "Offer is live in the shop." : "Offer saved as a draft.");
  });
  refreshStore();
  return result;
}

export async function toggleOffer(form: FormData) {
  const me = await assertAdmin("offers");
  const offerId = String(form.get("offerId") ?? "");
  await write((db) => {
    const o = catalog(db).offers.find((x) => x.id === offerId);
    if (o) {
      o.active = !o.active;
      log(db, me, "offers", `${o.active ? "Turned on" : "Turned off"} offer ${o.name}`, "/admin/offers");
    }
  });
  refreshStore();
}

export async function deleteOffer(form: FormData) {
  const me = await assertAdmin("offers");
  const offerId = String(form.get("offerId") ?? "");
  await write((db) => {
    const c = catalog(db);
    log(db, me, "offers", `Deleted offer ${c.offers.find((o) => o.id === offerId)?.name ?? ""}`, "/admin/offers");
    c.offers = c.offers.filter((o) => o.id !== offerId);
  });
  refreshStore();
}

/* ─── Coupons ────────────────────────────────────────────── */

export async function saveCoupon(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("coupons");
  const parsed = z
    .object({
      couponId: z.string().optional(),
      code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,20}$/, "3–20 letters, numbers or dashes"),
      type: z.enum(["percent", "fixed"]),
      value: z.coerce.number().int("Use a whole number").min(1, "Must be at least 1"),
      minSubtotal: optionalNumber,
      usageLimit: optionalNumber,
      expires: z.string().optional(),
      description: z.string().trim().min(3, "Describe the code for customers").max(100),
      active: checkbox,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  if (d.type === "percent" && d.value > 90) return oops("Percentage codes can be at most 90% off.", { value: "At most 90" });

  const result = await write((db) => {
    const list = coupons(db);
    const clash = list.find((c) => c.code === d.code && c.id !== d.couponId);
    if (clash) return oops(`The code ${d.code} already exists.`, { code: "Already in use" });
    const value = { code: d.code, type: d.type, value: d.value, minSubtotal: d.minSubtotal || undefined, usageLimit: d.usageLimit || undefined, expires: d.expires || undefined, description: d.description, active: d.active };
    const existing = d.couponId ? list.find((c) => c.id === d.couponId) : undefined;
    if (existing) Object.assign(existing, value);
    else list.unshift({ id: id("cpn"), used: 0, createdAt: new Date().toISOString(), ...value });
    log(db, me, "coupons", `${existing ? "Updated" : "Created"} coupon ${d.code}`, "/admin/coupons");
    return done(existing ? `${d.code} updated.` : `${d.code} created${d.active ? " — customers can use it now" : " as a draft"}.`);
  });
  revalidatePath("/admin", "layout");
  return result;
}

export async function toggleCoupon(form: FormData) {
  const me = await assertAdmin("coupons");
  const couponId = String(form.get("couponId") ?? "");
  await write((db) => {
    const c = coupons(db).find((x) => x.id === couponId);
    if (c) {
      c.active = !c.active;
      log(db, me, "coupons", `${c.active ? "Turned on" : "Turned off"} coupon ${c.code}`, "/admin/coupons");
    }
  });
  revalidatePath("/admin", "layout");
}

export async function deleteCoupon(form: FormData) {
  const me = await assertAdmin("coupons");
  const couponId = String(form.get("couponId") ?? "");
  await write((db) => {
    log(db, me, "coupons", `Deleted coupon ${coupons(db).find((c) => c.id === couponId)?.code ?? ""}`, "/admin/coupons");
    db.coupons = coupons(db).filter((c) => c.id !== couponId);
  });
  revalidatePath("/admin", "layout");
}

/* ─── Store settings ─────────────────────────────────────── */

export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("settings");
  const texts = form.getAll("annText").map(String);
  const hrefs = form.getAll("annHref").map(String);
  const parsed = z
    .object({
      announcements: z
        .array(z.object({ text: z.string().trim().max(90, "Keep messages under 90 characters"), href: z.string().trim().max(120) }))
        .transform((a) => a.filter((x) => x.text))
        .pipe(z.array(z.object({ text: z.string(), href: z.string().regex(/^(\/|https:\/\/)/, "Links start with / or https://") })).min(1, "Keep at least one message")),
      freeShippingThreshold: z.coerce.number().int().min(0).max(100000),
      standardShipping: z.coerce.number().int().min(0).max(5000),
      expressShipping: z.coerce.number().int().min(0).max(5000),
      codFee: z.coerce.number().int().min(0).max(1000),
    })
    .safeParse({ ...Object.fromEntries(form), announcements: texts.map((text, i) => ({ text, href: hrefs[i] || "/" })) });
  if (!parsed.success) return oops("Please fix the highlighted fields.", fieldErrors(parsed.error));
  await write((db) => {
    log(db, me, "settings", "Updated store settings (message bar and shipping)", "/admin/settings");
    catalog(db).settings = parsed.data as StoreSettings;
  });
  refreshStore();
  return done("Store settings saved. The shop is using them now.");
}

/* ─── Returns and inbox ──────────────────────────────────── */

const RETURN_FLOW: Record<ReturnRequest["status"], ReturnRequest["status"][]> = {
  requested: ["approved"],
  approved: ["picked_up"],
  picked_up: ["refunded", "exchanged"],
  refunded: [],
  exchanged: [],
};

export async function updateReturnStatus(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("returns");
  const parsed = z.object({ returnId: z.string().min(1), status: z.enum(["requested", "approved", "picked_up", "refunded", "exchanged"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Something in that form doesn’t look right.");
  const { returnId, status } = parsed.data;
  const result = await write((db) => {
    const r = db.returns.find((x) => x.id === returnId);
    if (!r) return oops("We couldn’t find that return.");
    if (!RETURN_FLOW[r.status].includes(status)) return oops("That return has already moved on. Refresh to see the latest.");
    r.status = status;
    log(db, me, "returns", `Return ${r.id} marked ${status.replace("_", " ")}`, "/admin/returns");
    return done(`Return marked ${status.replace("_", " ")}.`);
  });
  revalidatePath("/admin", "layout");
  return result;
}

export async function deleteMessage(form: FormData) {
  const me = await assertAdmin("inbox");
  const msgId = String(form.get("id") ?? "");
  await write((db) => {
    log(db, me, "inbox", `Deleted a message from ${db.contactMessages.find((m) => m.id === msgId)?.name ?? "a customer"}`, "/admin/inbox");
    db.contactMessages = db.contactMessages.filter((m) => m.id !== msgId);
  });
  revalidatePath("/admin/inbox");
}

/* ─── Photos ─────────────────────────────────────────────── */

/** A link to a photo: a full https:// address or a path on this site. */
const imageUrl = z.string().trim().regex(/^(https:\/\/|\/)\S+$/, "Add a photo");
const link = z.string().trim().max(200).regex(/^(\/|https:\/\/|mailto:|tel:)/, "Links start with / or https://");

export type UploadTicket = { ok: true; signedUrl: string; token: string; path: string; publicUrl: string } | { ok: false; message: string };

/** Step 1 of an upload: check the file and hand the browser a one-time URL to send it straight to storage. */
export async function requestUpload(input: { type: string; size: number; folder: string }): Promise<UploadTicket> {
  await assertAdmin("products");
  if (!mediaEnabled()) return { ok: false, message: "Photo uploads need Supabase. Add SUPABASE_SECRET_KEY to the environment, or paste a photo link instead." };
  if (!(MEDIA_TYPES as readonly string[]).includes(input.type)) return { ok: false, message: "Use a JPG, PNG, WebP or AVIF photo." };
  if (input.size > MEDIA_MAX_BYTES) return { ok: false, message: "That photo is over 10 MB. Export it smaller (2000px wide is plenty) and try again." };
  try {
    return { ok: true, ...(await signUpload(input.folder, input.type)) };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "The upload couldn’t start. Check the storage bucket “media” exists in Supabase, then try again." };
  }
}

export async function saveProductImages(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("products");
  const parsed = z
    .object({ productId: z.string().min(1), images: z.array(imageUrl).min(1, "Keep at least one photo").max(10, "Up to 10 photos") })
    .safeParse({ productId: form.get("productId"), images: form.getAll("images").map(String).filter(Boolean) });
  if (!parsed.success) return oops(parsed.error.issues[0]?.message ?? "Please check the photos.", fieldErrors(parsed.error));
  const { productId, images } = parsed.data;
  const result = await write((db) => {
    const c = catalog(db);
    const custom = c.custom.find((x) => x.id === productId);
    if (!custom && !baseProduct(productId)) return oops("That product no longer exists.");
    if (custom) custom.images = images;
    c.products[productId] = { ...(c.products[productId] ?? {}), images };
    log(db, me, "products", `Updated photos (${images.length})`, `/admin/products/${productId}`);
    return done("Photos saved. The first one is the main photo in the shop.");
  });
  refreshStore();
  return result;
}

export async function resetProductImages(form: FormData) {
  const me = await assertAdmin("products");
  const productId = String(form.get("productId") ?? "");
  await write((db) => {
    const patch = catalog(db).products[productId];
    log(db, me, "products", "Restored original photos", `/admin/products/${productId}`);
    if (patch) delete patch.images;
  });
  refreshStore();
}

/* ─── Site content ───────────────────────────────────────── */

const text = (max: number, msg = "Required") => z.string().trim().min(1, msg).max(max, `Keep it under ${max} characters`);
const optText = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters`);

const heroSlide = z.object({
  img: imageUrl,
  alt: optText(140),
  tag: optText(80),
  line1: text(24, "Add the first title line"),
  line2: optText(24),
  productSlug: optText(120),
  href: link,
  button: text(30, "Add the button text"),
  focus: z.string().trim().regex(/^\d{1,3}% \d{1,3}%$/).catch("50% 30%"),
});

export async function saveHero(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("content");
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("payload") ?? "[]"));
  } catch {
    return oops("Something went wrong reading the slides. Refresh and try again.");
  }
  const parsed = z.array(heroSlide).min(1, "Keep at least one slide").max(6, "Up to 6 slides").safeParse(raw);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    const n = typeof i?.path[0] === "number" ? `Slide ${i.path[0] + 1}: ` : "";
    return oops(`${n}${i?.message ?? "Please check the slides."}`);
  }
  const known = new Set(deriveProducts(emptyCatalog(), { includeHidden: true }).map((p) => p.slug));
  await write((db) => {
    const c = catalog(db);
    for (const p of deriveProducts(c, { includeHidden: true })) known.add(p.slug);
    const hero = parsed.data.map((s) => ({ ...s, productSlug: known.has(s.productSlug) ? s.productSlug : "" }));
    log(db, me, "content", `Updated homepage hero (${hero.length} slides)`, "/admin/content");
    c.content = { ...c.content, home: { ...currentHome(c), hero } };
  });
  refreshStore();
  return done("Hero saved. The homepage is showing the new slides.");
}

export async function saveHomeText(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("content");
  const g = (k: string) => String(form.get(k) ?? "");
  const parsed = z
    .object({
      promises: z.array(z.object({ title: text(40, "Add a title"), text: optText(80) })).length(4),
      shelf: z.object({ title: text(40), accent: optText(40), sub: optText(140) }),
      fresh: z.object({ title: text(40), accent: optText(40), sub: optText(140) }),
      story: z.object({ eyebrow: optText(40), title: text(60), accent: optText(40), body: text(900), button: text(30), href: link, img1: imageUrl, img2: imageUrl, badge: optText(30) }),
    })
    .safeParse({
      promises: [0, 1, 2, 3].map((i) => ({ title: g(`promise${i}Title`), text: g(`promise${i}Text`) })),
      shelf: { title: g("shelfTitle"), accent: g("shelfAccent"), sub: g("shelfSub") },
      fresh: { title: g("freshTitle"), accent: g("freshAccent"), sub: g("freshSub") },
      story: { eyebrow: g("storyEyebrow"), title: g("storyTitle"), accent: g("storyAccent"), body: g("storyBody"), button: g("storyButton"), href: g("storyHref"), img1: g("storyImg1"), img2: g("storyImg2"), badge: g("storyBadge") },
    });
  if (!parsed.success) {
    // Map nested paths back to the form's field names.
    const names: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const [a, b, c2] = i.path.map(String);
      const key = a === "promises" ? `promise${b}${c2 === "title" ? "Title" : "Text"}` : `${a}${b.charAt(0).toUpperCase()}${b.slice(1)}`;
      names[key] ??= i.message;
    }
    return oops("Please fix the highlighted fields.", names);
  }
  await write((db) => {
    const c = catalog(db);
    log(db, me, "content", "Updated homepage sections", "/admin/content?tab=home");
    c.content = { ...c.content, home: { ...currentHome(c), ...parsed.data } };
  });
  refreshStore();
  return done("Saved. The homepage is showing the new text and photos.");
}

export async function saveContact(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("content");
  const social = z.union([z.literal(""), z.string().trim().url("Use a full https:// link").max(200)]);
  const parsed = z
    .object({
      email: z.string().trim().email("Enter a valid email"),
      phone: text(30),
      whatsapp: text(30),
      hours: text(80),
      line1: text(100),
      line2: optText(100),
      city: text(40),
      state: text(40),
      pincode: z.string().trim().regex(/^\d{6}$/, "Use a 6-digit PIN code"),
      instagram: social,
      facebook: social,
      youtube: social,
      pinterest: social,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Please fix the highlighted fields.", fieldErrors(parsed.error));
  await write((db) => {
    const c = catalog(db);
    log(db, me, "content", "Updated contact details and social links", "/admin/content?tab=contact");
    c.content = { ...c.content, contact: parsed.data };
  });
  refreshStore();
  return done("Contact details saved. They’re updated across the site.");
}

/** Put a section of site content back to the original. */
export async function resetContent(form: FormData) {
  const me = await assertAdmin("content");
  const section = String(form.get("section") ?? "");
  await write((db) => {
    const c = catalog(db);
    log(db, me, "content", `Restored original ${section === "home" ? "homepage" : "contact details"}`, "/admin/content");
    if (section === "contact" && c.content) delete c.content.contact;
    if (section === "home" && c.content) delete c.content.home;
  });
  refreshStore();
}

/* ─── Team (owner only) ──────────────────────────────────── */

const staffPassword = z.string().min(10, "At least 10 characters").max(128).regex(/[A-Za-z]/, "Include a letter").regex(/\d/, "Include a number");

export async function addStaff(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("team");
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Enter their name").max(60),
      email: z.string().trim().toLowerCase().email("Enter a valid email"),
      role: z.enum(["owner", "manager", "support"]),
      password: staffPassword,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  if (ownerEmail() && d.email === ownerEmail()) return oops("That’s the owner’s email. Use a different one.", { email: "Already the owner" });
  const result = await write((db) => {
    const staff = (db.staff ??= []);
    if (staff.some((m) => m.email === d.email)) return oops("Someone on the team already uses that email.", { email: "Already on the team" });
    staff.push({ id: id("stf"), name: d.name, email: d.email, role: d.role, passwordHash: hashPassword(d.password), active: true, createdAt: new Date().toISOString() });
    log(db, me, "team", `Added ${d.name} (${d.email}) as ${ROLE_LABEL[d.role].toLowerCase()}`, "/admin/team");
    return done(`${d.name} can now sign in at /admin/login with that email and password. Share the password with them privately.`);
  });
  revalidatePath("/admin", "layout");
  return result;
}

export async function updateStaff(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("team");
  const parsed = z
    .object({ staffId: z.string().min(1), role: z.enum(["owner", "manager", "support"]), active: checkbox, password: z.union([z.literal(""), staffPassword]) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  const result = await write((db) => {
    const m = db.staff?.find((x) => x.id === d.staffId);
    if (!m) return oops("That person is no longer on the team.");
    if (m.id === me.id && (d.role !== m.role || !d.active)) return oops("You can’t change your own role or turn off your own access. Ask another owner.");
    const changes: string[] = [];
    if (m.role !== d.role) changes.push(`role → ${ROLE_LABEL[d.role].toLowerCase()}`);
    if (m.active !== d.active) changes.push(d.active ? "access turned on" : "access turned off");
    if (d.password) changes.push("new password");
    if (!changes.length) return done("Nothing changed.");
    m.role = d.role;
    m.active = d.active;
    if (d.password) m.passwordHash = hashPassword(d.password);
    log(db, me, "team", `${m.name}: ${changes.join(", ")}`, "/admin/team");
    return done(`Saved. ${d.password || changes.some((c) => c.startsWith("role")) ? `${m.name} needs to sign in again.` : ""}`.trim());
  });
  revalidatePath("/admin", "layout");
  return result;
}

export async function removeStaff(form: FormData) {
  const me = await assertAdmin("team");
  const staffId = String(form.get("staffId") ?? "");
  await write((db) => {
    const m = db.staff?.find((x) => x.id === staffId);
    if (!m || m.id === me.id) return; // nobody removes themselves (keeps at least one owner)
    db.staff = db.staff!.filter((x) => x.id !== staffId);
    log(db, me, "team", `Removed ${m.name} (${m.email}) from the team`, "/admin/team");
  });
  revalidatePath("/admin", "layout");
}

/* ─── Refunds ────────────────────────────────────────────── */

const REFUND_METHOD = { original: "Back to the original payment", bank: "Bank / UPI transfer", store_credit: "Store credit (gift card)", cash: "Cash" } as const;

export async function refundOrder(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("orders");
  const parsed = z
    .object({
      orderId: z.string().min(1),
      amount: z.coerce.number({ error: "Enter an amount" }).int("Use whole rupees").min(1, "At least ₹1"),
      method: z.enum(["original", "bank", "store_credit", "cash"]),
      reason: z.string().trim().min(3, "Say why, for your records").max(200),
      restock: checkbox,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  const result = await write((db) => {
    const order = db.orders.find((o) => o.id === d.orderId);
    if (!order) return oops("We couldn’t find that order.");
    if (order.payment.status === "pending") return oops("This order hasn’t been paid, so there’s nothing to refund.");
    if (order.payment.status === "cod" && order.status !== "delivered" && order.status !== "returned") return oops("Cash on delivery orders can only be refunded after the cash is collected (once delivered).");
    const already = (order.refunds ?? []).reduce((a, r) => a + r.amount, 0);
    const left = order.totals.total - already;
    if (d.amount > left) return oops(`You can refund at most ${left.toLocaleString("en-IN")} more on this order.`, { amount: `At most ₹${left}` });
    const anyRestocked = (order.refunds ?? []).some((r) => r.restocked);
    const restock = d.restock && !anyRestocked && order.status !== "cancelled";
    if (restock) for (const i of order.items) if (i.productId !== GIFT_CARD && db.inventoryAdjustments[i.sku]) db.inventoryAdjustments[i.sku] -= i.quantity;
    let note = `Refunded ₹${d.amount.toLocaleString("en-IN")} · ${REFUND_METHOD[d.method]} · ${d.reason}`;
    if (d.method === "store_credit") {
      const code = `TW-CR-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      db.giftCards.push({ code, balance: d.amount, initial: d.amount, recipientEmail: order.email, createdAt: new Date().toISOString() });
      note += ` · gift card ${code}`;
    }
    (order.refunds ??= []).push({ id: id("rfd"), amount: d.amount, reason: d.reason, method: d.method, restocked: restock, at: new Date().toISOString(), by: me.name });
    order.timeline.push({ status: order.status, at: new Date().toISOString(), note });
    log(db, me, "orders", `Order ${order.id}: ${note}`, `/admin/orders/${order.id}`);
    return done(
      d.method === "store_credit"
        ? `Refund recorded and a gift card for ₹${d.amount.toLocaleString("en-IN")} was created for ${order.email}.`
        : `Refund of ₹${d.amount.toLocaleString("en-IN")} recorded. Remember to send the money${d.method === "original" ? " from your payment provider’s dashboard" : ""}.`,
    );
  });
  revalidatePath("/admin", "layout");
  return result;
}

/* ─── Products: bulk changes and CSV import ──────────────── */

const BULK = ["hide", "show", "new_on", "new_off", "best_on", "best_off", "sale", "unsale", "price_pct"] as const;

export async function bulkProducts(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("products");
  const parsed = z
    .object({
      ids: z.array(z.string().min(1)).min(1, "Tick at least one product").max(500),
      op: z.enum(BULK, { error: "Choose what to do" }),
      value: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().int().optional()),
    })
    .safeParse({ ids: form.getAll("ids").map(String), op: form.get("op"), value: form.get("value") });
  if (!parsed.success) return oops(parsed.error.issues[0]?.message ?? "Please check your choice.");
  const { ids, op, value } = parsed.data;
  if ((op === "sale" && (!value || value < 1 || value > 90)) || (op === "price_pct" && (!value || value < -90 || value > 300)))
    return oops(op === "sale" ? "Enter a sale between 1% and 90% off." : "Enter a change between −90% and +300%.");

  const result = await write((db) => {
    const c = catalog(db);
    const own = new Map(deriveProducts({ ...c, offers: [] }, { includeHidden: true }).map((p) => [p.id, p]));
    let n = 0;
    for (const pid of ids) {
      const p = own.get(pid);
      if (!p) continue;
      const custom = c.custom.find((x) => x.id === pid);
      const patch = (c.products[pid] ??= {});
      const base = p.compareAtPrice ?? p.price; // the full price before any sale
      const setPrice = (price: number, compare: number | null) => {
        if (custom) Object.assign(custom, { price, compareAtPrice: compare ?? undefined });
        else Object.assign(patch, { price, compareAtPrice: compare });
      };
      if (op === "hide") patch.hidden = true;
      if (op === "show") patch.hidden = false;
      if (op === "new_on" || op === "new_off") {
        patch.isNew = op === "new_on";
        if (custom) custom.isNew = op === "new_on";
      }
      if (op === "best_on") patch.isBestSeller = true;
      if (op === "best_off") patch.isBestSeller = false;
      if (op === "sale") setPrice(Math.max(1, Math.round((base * (100 - value!)) / 100)), base);
      if (op === "unsale") setPrice(base, null);
      if (op === "price_pct") {
        const price = Math.max(1, Math.round((p.price * (100 + value!)) / 100));
        const compare = p.compareAtPrice ? Math.max(price + 1, Math.round((p.compareAtPrice * (100 + value!)) / 100)) : null;
        setPrice(price, compare);
      }
      n++;
    }
    const what = { hide: "hidden", show: "shown in the shop", new_on: "marked new", new_off: "no longer marked new", best_on: "marked best seller", best_off: "no longer best sellers", sale: `put on sale (${value}% off)`, unsale: "taken off sale", price_pct: `price changed by ${value! > 0 ? "+" : ""}${value}%` }[op];
    log(db, me, "products", `${n} ${n === 1 ? "product" : "products"} ${what}`, "/admin/products");
    return done(`${n} ${n === 1 ? "product" : "products"} ${what}.`);
  });
  refreshStore();
  return result;
}

const yes = (v: string) => /^(y|yes|true|1|hidden)$/i.test(v.trim());

/** Import a products or stock CSV (exported from this page). Blank cells leave the value as it is. */
export async function importCSV(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("products");
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return oops("Choose a CSV file first.");
  if (file.size > 900_000) return oops("That file is too big (over 900 KB). Split it into smaller files.");
  const { columns, rows } = csvObjects(await file.text());
  const isStock = columns.includes("sku") && columns.includes("stock");
  const isProducts = columns.includes("id");
  if (!isStock && !isProducts) return oops("This doesn’t look like a Threads Wear export. Download the products or stock CSV, edit it, and import that.");
  if (!rows.length) return oops("The file has no rows.");

  const errors: string[] = [];
  const result = await write((db) => {
    const c = catalog(db);
    const own = new Map(deriveProducts({ ...c, offers: [] }, { includeHidden: true }).map((p) => [p.id, p]));
    let changed = 0;
    rows.forEach((r, i) => {
      const line = i + 2;
      if (isStock && !isProducts) {
        const p = [...own.values()].find((x) => x.variants.some((v) => v.sku === r.sku));
        if (!p) return void errors.push(`Row ${line}: no product has SKU ${r.sku || "(empty)"}`);
        if (r.stock === "") return;
        const qty = Number(r.stock);
        if (!Number.isInteger(qty) || qty < 0 || qty > 9999) return void errors.push(`Row ${line}: stock must be a whole number 0–9999`);
        const patch = (c.products[p.id] ??= {});
        patch.stock = { ...patch.stock, [r.sku]: qty };
        db.inventoryAdjustments[r.sku] = 0;
        changed++;
        return;
      }
      const p = own.get(r.id);
      if (!p) return void errors.push(`Row ${line}: no product with id ${r.id || "(empty)"}`);
      const custom = c.custom.find((x) => x.id === p.id);
      const patch = { ...(c.products[p.id] ?? {}) };
      const num = (k: string) => (r[k] === undefined || r[k] === "" ? undefined : Number(r[k].replace(/[₹,\s]/g, "")));
      const price = num("price");
      const compare = num("compare_at_price");
      if (price !== undefined && (!Number.isInteger(price) || price < 1 || price > 500000)) return void errors.push(`Row ${line}: price must be a whole number of rupees`);
      if (compare !== undefined && (!Number.isInteger(compare) || compare <= (price ?? p.price))) return void errors.push(`Row ${line}: compare_at_price must be higher than the price`);
      const before = JSON.stringify([patch, custom]);
      if (r.name && r.name.length >= 2) {
        if (custom) custom.name = r.name.slice(0, 90);
        else patch.name = r.name.slice(0, 90);
      }
      if (price !== undefined) {
        if (custom) custom.price = price;
        else patch.price = price;
      }
      if (columns.includes("compare_at_price")) {
        if (custom) custom.compareAtPrice = compare;
        else patch.compareAtPrice = compare ?? null;
      }
      if (r.hidden !== undefined && r.hidden !== "") patch.hidden = yes(r.hidden);
      if (r.new !== undefined && r.new !== "") {
        patch.isNew = yes(r.new);
        if (custom) custom.isNew = yes(r.new);
      }
      if (r.bestseller !== undefined && r.bestseller !== "") patch.isBestSeller = yes(r.bestseller);
      if (r.seo_title !== undefined) patch.seoTitle = r.seo_title.slice(0, 70) || undefined;
      if (r.seo_description !== undefined) patch.seoDescription = r.seo_description.slice(0, 170) || undefined;
      if (r.short_description && r.short_description.length >= 5) {
        if (custom) custom.shortDescription = r.short_description.slice(0, 200);
        else patch.shortDescription = r.short_description.slice(0, 200);
      }
      if (JSON.stringify([patch, custom]) !== before) {
        c.products[p.id] = patch;
        changed++;
      }
    });
    if (changed) log(db, me, "products", `Imported ${isProducts ? "products" : "stock"} CSV: ${changed} ${changed === 1 ? "row" : "rows"} changed`, "/admin/products");
    return changed;
  });
  refreshStore();
  const msg = `${result} ${result === 1 ? "row" : "rows"} updated${errors.length ? `, ${errors.length} skipped` : ""}.`;
  return errors.length ? { ok: result > 0, message: `${msg} ${errors.slice(0, 5).join(" · ")}${errors.length > 5 ? " …" : ""}` } : done(result ? msg : "Nothing changed — the file matches what’s already in the shop.");
}

/* ─── Reviews ────────────────────────────────────────────── */

export async function moderateReview(form: FormData) {
  const me = await assertAdmin("reviews");
  const reviewId = String(form.get("reviewId") ?? "");
  const op = String(form.get("op") ?? "");
  if (!["approve", "reject", "delete"].includes(op)) return;
  await write((db) => {
    const r = db.reviews.find((x) => x.id === reviewId);
    if (!r) return;
    const name = getProductById(r.productId)?.name ?? r.productId;
    if (op === "delete") db.reviews = db.reviews.filter((x) => x.id !== reviewId);
    else r.status = op === "approve" ? "approved" : "rejected";
    log(db, me, "reviews", `${op === "approve" ? "Approved" : op === "reject" ? "Rejected" : "Deleted"} ${r.rating}★ review of ${name} by ${r.author}`, "/admin/reviews");
  });
  revalidatePath("/admin", "layout");
}

/* ─── Customers ──────────────────────────────────────────── */

export async function setCustomerBlocked(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await assertAdmin("customers");
  const parsed = z.object({ userId: z.string().min(1), block: checkbox, reason: z.string().trim().max(200).optional() }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Something in that form doesn’t look right.");
  const { userId, block, reason } = parsed.data;
  if (block && !reason) return oops("Add a short reason, for your records.", { reason: "Required to block" });
  const result = await write((db) => {
    const u = db.users.find((x) => x.id === userId);
    if (!u) return oops("That customer no longer exists.");
    if (block) u.blocked = { at: new Date().toISOString(), reason: reason! };
    else delete u.blocked;
    log(db, me, "customers", `${block ? "Blocked" : "Unblocked"} ${u.firstName} ${u.lastName} (${u.email})${block ? ` · ${reason}` : ""}`, `/admin/customers/${u.id}`);
    return done(block ? `${u.firstName} is blocked: they’re signed out and can’t sign in or place orders.` : `${u.firstName} is unblocked and can shop again.`);
  });
  revalidatePath("/admin", "layout");
  return result;
}
