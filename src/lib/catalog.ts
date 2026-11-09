import type { Badge, Product, ProductColor, Size } from "@/lib/types";
import { products } from "@/data/products";
import { announcements, commerce } from "@/lib/site";

/**
 * Admin-editable layer over the code catalogue.
 *
 * The products in `src/data/products.ts` are the starting point. Everything the admin changes — names, prices,
 * offers, stock, hiding a piece, brand-new products, store settings — is stored as data and applied in place to
 * the shared `products` array, `commerce` and `announcements`, so every page and helper sees it without changes.
 * It runs on the server (from the data store) and in the browser (from the root layout), from the same state.
 */

export type ProductPatch = {
  name?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  /** Original price shown struck through. `null` clears a sale set in code. */
  compareAtPrice?: number | null;
  /** "auto" (default) lets the store choose: Limited › Sale › New › Bestseller. */
  badge?: Badge | "auto" | "none";
  isNew?: boolean;
  isBestSeller?: boolean;
  hidden?: boolean;
  /** Units on hand per SKU, set by the admin. */
  stock?: Record<string, number>;
};

export type CustomProductInput = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  shortDescription: string;
  description: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: Size[];
  stock: number;
  fit: Product["fit"];
  materials: string;
  isNew: boolean;
  createdAt: string;
};

export type Offer = {
  id: string;
  name: string;
  percent: number;
  /** "all", a category slug ("cat:shirts") or a collection slug ("col:signature"). */
  scope: string;
  active: boolean;
  endsAt?: string;
};

export type StoreSettings = {
  announcements: { text: string; href: string }[];
  freeShippingThreshold: number;
  standardShipping: number;
  expressShipping: number;
  codFee: number;
};

export type CatalogState = {
  products: Record<string, ProductPatch>;
  custom: CustomProductInput[];
  offers: Offer[];
  settings?: StoreSettings;
};

export const emptyCatalog = (): CatalogState => ({ products: {}, custom: [], offers: [] });

// Pristine copies, taken once, so applying is repeatable (apply A, then B, never stacks).
const BASE: Product[] = products.map((p) => structuredClone(p));
const BASE_COMMERCE = { ...commerce };
const BASE_ANNOUNCEMENTS = announcements.map((a) => ({ ...a }));

export function baseProduct(id: string) {
  return BASE.find((p) => p.id === id);
}

export function offerApplies(o: Offer, p: Product, now = Date.now()) {
  if (!o.active || o.percent <= 0) return false;
  if (o.endsAt && new Date(o.endsAt).getTime() < now) return false;
  if (o.scope === "all") return true;
  if (o.scope.startsWith("cat:")) return p.category === o.scope.slice(4);
  if (o.scope.startsWith("col:")) return p.collection.includes(o.scope.slice(4));
  return false;
}

function autoBadge(p: Product): Badge | undefined {
  if (p.isLimitedEdition) return "Limited Edition";
  if (p.compareAtPrice) return "Sale";
  if (p.isNew) return "New";
  if (p.isBestSeller) return "Bestseller";
  return undefined;
}

export function buildCustomProduct(c: CustomProductInput): Product {
  const code = c.id.replace(/^p_/, "").toUpperCase();
  const colors: ProductColor[] = c.colors.map((x) => ({ name: x.name, hex: x.hex }));
  const variants = colors.flatMap((col) =>
    c.sizes.map((s) => ({ sku: `TW-${code}-${col.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase()}-${s.replace(/\s/g, "")}`, color: col.name, size: s, stock: c.stock })),
  );
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    shortDescription: c.shortDescription,
    category: c.category,
    subcategory: c.subcategory,
    collection: c.isNew ? ["new-season"] : [],
    price: c.price,
    compareAtPrice: c.compareAtPrice,
    currency: "INR",
    images: c.images,
    colors,
    sizes: c.sizes,
    materials: c.materials,
    composition: [c.materials],
    fit: c.fit,
    careInstructions: ["Follow the care label inside the garment"],
    features: [],
    sku: `TW-${code}`,
    variants,
    stock: variants.reduce((a, v) => a + v.stock, 0),
    tags: [],
    rating: 0,
    reviewCount: 0,
    ratingBreakdown: { quality: 0, fit: 0, value: 0 },
    isNew: c.isNew,
    isBestSeller: false,
    isLimitedEdition: false,
    isTrending: false,
    pattern: "Solid",
    occasion: ["Everyday"],
    createdAt: c.createdAt,
  };
}

/** Build the live product list from the code catalogue plus the admin's edits. Pure — doesn't touch shared state. */
export function deriveProducts(state: CatalogState, { includeHidden = false } = {}): Product[] {
  const all = [...BASE.map((p) => structuredClone(p)), ...state.custom.map(buildCustomProduct)];
  const out: Product[] = [];
  for (const p of all) {
    const patch = state.products[p.id] ?? {};
    if (patch.hidden && !includeHidden) continue;
    if (patch.name) p.name = patch.name;
    if (patch.shortDescription) p.shortDescription = patch.shortDescription;
    if (patch.description) p.description = patch.description;
    if (patch.price) p.price = patch.price;
    if (patch.compareAtPrice === null) p.compareAtPrice = undefined;
    else if (patch.compareAtPrice) p.compareAtPrice = patch.compareAtPrice;
    if (patch.isNew !== undefined) p.isNew = patch.isNew;
    if (patch.isBestSeller !== undefined) p.isBestSeller = patch.isBestSeller;
    if (patch.stock) {
      for (const v of p.variants) if (patch.stock[v.sku] !== undefined) v.stock = patch.stock[v.sku];
      p.stock = p.variants.reduce((a, v) => a + v.stock, 0);
    }

    // Best running offer wins, unless the piece already has its own sale price.
    const offer = state.offers.filter((o) => offerApplies(o, p)).sort((a, b) => b.percent - a.percent)[0];
    if (offer && !p.compareAtPrice) {
      p.compareAtPrice = p.price;
      p.price = Math.max(1, Math.round((p.price * (100 - offer.percent)) / 100));
    }
    p.discount = p.compareAtPrice && p.compareAtPrice > p.price ? Math.round((1 - p.price / p.compareAtPrice) * 100) : undefined;
    if (!p.discount) p.compareAtPrice = undefined;

    p.badge = patch.badge === "none" ? undefined : patch.badge && patch.badge !== "auto" ? patch.badge : autoBadge(p);
    out.push(p);
  }
  return out;
}

let applied = "";

/** Apply admin state to the shared catalogue, commerce settings and announcements. Cheap to call repeatedly. */
export function applyCatalog(state: CatalogState | null | undefined) {
  const s = state ?? emptyCatalog();
  const key = JSON.stringify(s) + new Date().toISOString().slice(0, 13); // re-check offer end dates hourly
  if (key === applied) return;
  applied = key;

  const next = deriveProducts(s);
  products.splice(0, products.length, ...next);

  Object.assign(commerce, BASE_COMMERCE, s.settings ? {
    freeShippingThreshold: s.settings.freeShippingThreshold,
    standardShipping: s.settings.standardShipping,
    expressShipping: s.settings.expressShipping,
    codFee: s.settings.codFee,
  } : {});
  announcements.splice(0, announcements.length, ...(s.settings?.announcements?.length ? s.settings.announcements : BASE_ANNOUNCEMENTS).map((a) => ({ ...a })));
}

export function currentSettings(state: CatalogState): StoreSettings {
  return state.settings ?? {
    announcements: BASE_ANNOUNCEMENTS.map((a) => ({ ...a })),
    freeShippingThreshold: BASE_COMMERCE.freeShippingThreshold,
    standardShipping: BASE_COMMERCE.standardShipping,
    expressShipping: BASE_COMMERCE.expressShipping,
    codFee: BASE_COMMERCE.codFee,
  };
}
