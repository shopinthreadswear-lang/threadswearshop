"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { z } from "zod";
import type { Badge, OrderStatus, ReturnRequest, Size } from "@/lib/types";
import { baseProduct, buildCustomProduct, currentHome, deriveProducts, emptyCatalog, type CustomProductInput, type StoreSettings } from "@/lib/catalog";
import { mediaEnabled, MEDIA_MAX_BYTES, MEDIA_TYPES, signUpload } from "@/lib/server/media";
import { categories } from "@/data/categories";
import { assertAdmin, nextStatuses, STATUS_LABEL } from "@/lib/server/admin";
import { coupons } from "@/lib/server/promos";
import { write, type DB } from "@/lib/server/store";

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
  await assertAdmin();
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
    return done(status === "cancelled" ? "Order cancelled and the stock put back." : `Order marked ${STATUS_LABEL[status as OrderStatus].toLowerCase()}.`);
  });
  revalidatePath("/admin", "layout");
  return result;
}

/* ─── Products ───────────────────────────────────────────── */

const BADGES = ["auto", "none", "New", "Bestseller", "Limited Edition", "Sale"] as const;

export async function saveProduct(_: ActionState, form: FormData): Promise<ActionState> {
  await assertAdmin();
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
    };
    return done(d.hidden ? "Saved. This product is hidden from the shop." : "Saved. The shop is showing the new details.");
  });
  refreshStore();
  return result;
}

/** Set the units on hand for one colour and size. Sales after this count down from the new number. */
export async function setStock(_: ActionState, form: FormData): Promise<ActionState> {
  await assertAdmin();
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
    return done(`${variant.color} · ${variant.size}: ${qty} in stock.`);
  });
  refreshStore();
  return result;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "46"] as const;

export async function createProduct(_: ActionState, form: FormData): Promise<ActionState> {
  await assertAdmin();
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
    c.custom.push(input);
    return input.id;
  });
  refreshStore();
  redirect(`/admin/products/${newId}?created=1`);
}

export async function deleteCustomProduct(form: FormData) {
  await assertAdmin();
  const productId = String(form.get("productId") ?? "");
  await write((db) => {
    const c = catalog(db);
    c.custom = c.custom.filter((x) => x.id !== productId);
    delete c.products[productId];
  });
  refreshStore();
  redirect("/admin/products?deleted=1");
}

/** Undo every admin edit to a code-catalogue product. */
export async function resetProduct(form: FormData) {
  await assertAdmin();
  const productId = String(form.get("productId") ?? "");
  await write((db) => {
    delete catalog(db).products[productId];
  });
  refreshStore();
  redirect(`/admin/products/${productId}?reset=1`);
}

/* ─── Offers ─────────────────────────────────────────────── */

export async function saveOffer(_: ActionState, form: FormData): Promise<ActionState> {
  await assertAdmin();
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
    return done(existing ? "Offer updated." : d.active ? "Offer is live in the shop." : "Offer saved as a draft.");
  });
  refreshStore();
  return result;
}

export async function toggleOffer(form: FormData) {
  await assertAdmin();
  const offerId = String(form.get("offerId") ?? "");
  await write((db) => {
    const o = catalog(db).offers.find((x) => x.id === offerId);
    if (o) o.active = !o.active;
  });
  refreshStore();
}

export async function deleteOffer(form: FormData) {
  await assertAdmin();
  const offerId = String(form.get("offerId") ?? "");
  await write((db) => {
    const c = catalog(db);
    c.offers = c.offers.filter((o) => o.id !== offerId);
  });
  refreshStore();
}

/* ─── Coupons ────────────────────────────────────────────── */

export async function saveCoupon(_: ActionState, form: FormData): Promise<ActionState> {
  await assertAdmin();
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
    return done(existing ? `${d.code} updated.` : `${d.code} created${d.active ? " — customers can use it now" : " as a draft"}.`);
  });
  revalidatePath("/admin", "layout");
  return result;
}

export async function toggleCoupon(form: FormData) {
  await assertAdmin();
  const couponId = String(form.get("couponId") ?? "");
  await write((db) => {
    const c = coupons(db).find((x) => x.id === couponId);
    if (c) c.active = !c.active;
  });
  revalidatePath("/admin", "layout");
}

export async function deleteCoupon(form: FormData) {
  await assertAdmin();
  const couponId = String(form.get("couponId") ?? "");
  await write((db) => {
    db.coupons = coupons(db).filter((c) => c.id !== couponId);
  });
  revalidatePath("/admin", "layout");
}

/* ─── Store settings ─────────────────────────────────────── */

export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await assertAdmin();
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
  await assertAdmin();
  const parsed = z.object({ returnId: z.string().min(1), status: z.enum(["requested", "approved", "picked_up", "refunded", "exchanged"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return oops("Something in that form doesn’t look right.");
  const { returnId, status } = parsed.data;
  const result = await write((db) => {
    const r = db.returns.find((x) => x.id === returnId);
    if (!r) return oops("We couldn’t find that return.");
    if (!RETURN_FLOW[r.status].includes(status)) return oops("That return has already moved on. Refresh to see the latest.");
    r.status = status;
    return done(`Return marked ${status.replace("_", " ")}.`);
  });
  revalidatePath("/admin", "layout");
  return result;
}

export async function deleteMessage(form: FormData) {
  await assertAdmin();
  const msgId = String(form.get("id") ?? "");
  await write((db) => {
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
  await assertAdmin();
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
  await assertAdmin();
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
    return done("Photos saved. The first one is the main photo in the shop.");
  });
  refreshStore();
  return result;
}

export async function resetProductImages(form: FormData) {
  await assertAdmin();
  const productId = String(form.get("productId") ?? "");
  await write((db) => {
    const patch = catalog(db).products[productId];
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
  await assertAdmin();
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
    c.content = { ...c.content, home: { ...currentHome(c), hero } };
  });
  refreshStore();
  return done("Hero saved. The homepage is showing the new slides.");
}

export async function saveHomeText(_: ActionState, form: FormData): Promise<ActionState> {
  await assertAdmin();
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
    c.content = { ...c.content, home: { ...currentHome(c), ...parsed.data } };
  });
  refreshStore();
  return done("Saved. The homepage is showing the new text and photos.");
}

export async function saveContact(_: ActionState, form: FormData): Promise<ActionState> {
  await assertAdmin();
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
    c.content = { ...c.content, contact: parsed.data };
  });
  refreshStore();
  return done("Contact details saved. They’re updated across the site.");
}

/** Put a section of site content back to the original. */
export async function resetContent(form: FormData) {
  await assertAdmin();
  const section = String(form.get("section") ?? "");
  await write((db) => {
    const c = catalog(db);
    if (section === "contact" && c.content) delete c.content.contact;
    if (section === "home" && c.content) delete c.content.home;
  });
  refreshStore();
}
