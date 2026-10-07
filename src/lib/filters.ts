import type { Product } from "./types";
import { categories, slugifyType } from "@/data/categories";
import { collections } from "@/data/collections";

export type FacetKey = "category" | "type" | "size" | "fit" | "color" | "material" | "sleeve" | "pattern" | "occasion" | "price" | "availability" | "collection" | "discount";

export const FACET_LABELS: Record<FacetKey, string> = {
  category: "Category",
  type: "Product Type",
  size: "Size",
  fit: "Fit",
  color: "Colour",
  material: "Material",
  sleeve: "Sleeve",
  pattern: "Pattern",
  occasion: "Occasion",
  price: "Price",
  availability: "Availability",
  collection: "Collection",
  discount: "Discount",
};

const MATERIALS = ["Cotton", "Linen", "Wool", "Cashmere", "Merino", "Silk", "Leather", "Suede", "Denim", "Nylon"];
export const PRICE_BUCKETS = [
  { id: "under-2500", label: "Under ₹2,500", test: (p: number) => p < 2500 },
  { id: "2500-5000", label: "₹2,500 – ₹5,000", test: (p: number) => p >= 2500 && p < 5000 },
  { id: "5000-10000", label: "₹5,000 – ₹10,000", test: (p: number) => p >= 5000 && p < 10000 },
  { id: "10000-plus", label: "₹10,000 & above", test: (p: number) => p >= 10000 },
];

export const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "best-selling", label: "Best Selling" },
  { id: "price-asc", label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
] as const;
export type SortId = (typeof SORTS)[number]["id"];

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "P", "R", "T", "V", "One Size"];

function materialsOf(p: Product) {
  const m = `${p.materials} ${p.composition.join(" ")}`.toLowerCase();
  return MATERIALS.filter((x) => m.includes(x.toLowerCase()));
}

export function valuesFor(p: Product, key: FacetKey): string[] {
  switch (key) {
    case "category":
      return [categories.find((c) => c.slug === p.category)?.name ?? p.category];
    case "type":
      return [slugifyType(p.subcategory)];
    case "size":
      return p.sizes.filter((s) => p.variants.some((v) => v.size === s && v.stock > 0));
    case "fit":
      return [p.fit];
    case "color":
      return p.colors.map((c) => c.name);
    case "material":
      return materialsOf(p);
    case "sleeve":
      return p.sleeve ? [p.sleeve] : [];
    case "pattern":
      return [p.pattern];
    case "occasion":
      return p.occasion;
    case "price":
      return PRICE_BUCKETS.filter((b) => b.test(p.price)).map((b) => b.id);
    case "availability":
      return p.stock > 0 ? ["in-stock"] : [];
    case "collection":
      return p.collection;
    case "discount":
      return p.compareAtPrice ? ["on-sale", ...(p.discount && p.discount >= 20 ? ["20-plus"] : [])] : [];
  }
}

export function labelFor(key: FacetKey, value: string) {
  if (key === "type") return categories.flatMap((c) => c.types).find((t) => slugifyType(t) === value) ?? value;
  if (key === "price") return PRICE_BUCKETS.find((b) => b.id === value)?.label ?? value;
  if (key === "availability") return "In stock";
  if (key === "collection") return collections.find((c) => c.slug === value)?.name ?? value;
  if (key === "discount") return value === "on-sale" ? "On sale" : "20% off or more";
  return value;
}

export type Filters = Partial<Record<FacetKey, string[]>>;

export function applyFilters(list: Product[], f: Filters) {
  return list.filter((p) =>
    (Object.keys(f) as FacetKey[]).every((k) => {
      const sel = f[k];
      if (!sel?.length) return true;
      const vals = valuesFor(p, k);
      return sel.some((s) => vals.includes(s));
    }),
  );
}

export function sortProducts(list: Product[], s: SortId) {
  const out = [...list];
  switch (s) {
    case "newest":
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "best-selling":
      return out.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller) || b.reviewCount - a.reviewCount);
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    default:
      return out;
  }
}

/** Facet options with counts, computed against the list filtered by every *other* facet. */
export function facetOptions(list: Product[], f: Filters, key: FacetKey) {
  const others = { ...f, [key]: [] };
  const base = applyFilters(list, others);
  const counts = new Map<string, number>();
  for (const p of base) for (const v of new Set(valuesFor(p, key))) counts.set(v, (counts.get(v) ?? 0) + 1);
  const all = new Set(list.flatMap((p) => valuesFor(p, key)));
  let opts = [...all].map((v) => ({ value: v, label: labelFor(key, v), count: counts.get(v) ?? 0 }));
  if (key === "size") opts = opts.sort((a, b) => SIZE_ORDER.indexOf(a.value) - SIZE_ORDER.indexOf(b.value));
  else if (key === "price") opts = opts.sort((a, b) => PRICE_BUCKETS.findIndex((x) => x.id === a.value) - PRICE_BUCKETS.findIndex((x) => x.id === b.value));
  else opts = opts.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return opts;
}

export function colorHex(list: Product[], name: string) {
  for (const p of list) {
    const c = p.colors.find((x) => x.name === name);
    if (c) return c.hex;
  }
  return "#ccc";
}
