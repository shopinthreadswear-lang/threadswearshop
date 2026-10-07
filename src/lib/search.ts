import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { collections } from "@/data/collections";
import type { Product } from "./types";

const SYNONYMS: Record<string, string[]> = {
  tee: ["t-shirt", "tshirt", "tees"],
  "t-shirt": ["tee", "tshirt"],
  tshirt: ["tee", "t-shirt"],
  designer: ["blazer", "suit", "nehru", "tailoring", "limited"],
  tailoring: ["blazer", "suit", "suiting"],
  ethnic: ["nehru", "occasion", "wedding"],
  sweater: ["knit", "knitwear", "jumper"],
  jumper: ["sweater", "knit"],
  jacket: ["jackets", "outerwear"],
  coat: ["overcoat", "outerwear"],
  suit: ["suiting", "blazer"],
  oversized: ["oversized", "relaxed", "boxy"],
  black: ["onyx", "black"],
  white: ["optic white", "ivory", "chalk", "ecru"],
  blue: ["navy", "indigo", "chambray", "pale blue"],
  shirt: ["shirts", "oxford", "poplin"],
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
const stem = (w: string) => w.replace(/(es|s)$/, "");

function haystack(p: Product) {
  const cat = categories.find((c) => c.slug === p.category);
  const cols = p.collection.map((c) => collections.find((x) => x.slug === c)?.name ?? c);
  return {
    name: norm(p.name),
    strong: norm([p.subcategory, cat?.name, cat?.title, p.fit, ...p.tags].join(" ")),
    weak: norm([p.colors.map((c) => c.name).join(" "), p.materials, p.shortDescription, p.pattern, cols.join(" "), p.occasion.join(" ")].join(" ")),
  };
}

const INDEX = products.map((p) => ({ p, h: haystack(p) }));

export function searchProducts(query: string, limit = 60): Product[] {
  const q = norm(query);
  if (!q) return [];
  const terms = q.split(" ").filter((t) => t.length > 1);
  const scored = INDEX.map(({ p, h }) => {
    let score = 0;
    let matchedAll = true;
    for (const t of terms) {
      const variants = [t, stem(t), ...(SYNONYMS[t] ?? []), ...(SYNONYMS[stem(t)] ?? [])];
      let best = 0;
      for (const v of variants) {
        if (h.name.includes(v)) best = Math.max(best, 6);
        else if (h.strong.includes(v)) best = Math.max(best, 4);
        else if (h.weak.includes(v)) best = Math.max(best, 1.5);
      }
      if (!best) matchedAll = false;
      score += best;
    }
    if (h.name.includes(q)) score += 6;
    if (!matchedAll) score *= 0.35;
    if (p.isBestSeller) score += 0.4;
    return { p, score };
  })
    .filter((x) => x.score >= 1.5)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.p);
}

export const trendingSearches = ["Oversized T-Shirts", "Black T-Shirts", "Linen Shirts", "Polo Shirts", "Oxford Shirt", "Suede Jacket", "Overshirts", "Blazers"];
export const popularCategories = [
  { label: "T-Shirts", href: "/men/t-shirts" },
  { label: "Shirts", href: "/men/shirts" },
  { label: "Knitwear", href: "/men/knitwear" },
  { label: "Jackets", href: "/men/jackets" },
  { label: "Designer Wear", href: "/men/designer-wear" },
  { label: "Coats", href: "/men/coats" },
];
