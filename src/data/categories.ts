import type { Category } from "@/lib/types";
import { IMG } from "./images";

export const categories: Category[] = [
  {
    slug: "t-shirts",
    name: "T-Shirts",
    title: "Men's T-Shirts",
    group: "Topwear",
    description: "Heavyweight jerseys, supima crews and considered silhouettes — the foundation of a wardrobe that works harder than it looks.",
    image: IMG.teeBlackModel2,
    types: ["Basic T-Shirts", "Oversized T-Shirts", "Relaxed Fit T-Shirts", "Slim Fit T-Shirts", "Graphic T-Shirts", "Printed T-Shirts", "Polo T-Shirts", "Henley T-Shirts", "Long Sleeve T-Shirts", "Striped T-Shirts"],
  },
  {
    slug: "shirts",
    name: "Shirts",
    title: "Men's Shirts",
    group: "Topwear",
    description: "Oxford cloth, washed linen and crisp poplin — cut with a precise collar and a body that moves from boardroom to bar.",
    image: IMG.manWhiteShirt,
    types: ["Formal Shirts", "Casual Shirts", "Oxford Shirts", "Linen Shirts", "Overshirts", "Cuban Collar Shirts", "Printed Shirts", "Checked Shirts", "Striped Shirts", "Denim Shirts", "Flannel Shirts", "Mandarin Collar Shirts"],
  },
  {
    slug: "polos",
    name: "Polos",
    title: "Men's Polos",
    group: "Topwear",
    description: "Knitted and piqué polos with a soft collar roll. The smartest way to dress down.",
    image: IMG.polosFlat,
    types: ["Polo T-Shirts", "Polo Knits"],
  },
  {
    slug: "sweatshirts-hoodies",
    name: "Sweatshirts & Hoodies",
    title: "Sweatshirts & Hoodies",
    group: "Topwear",
    description: "Loopback cotton with real weight and a clean finish. Off-duty, elevated.",
    image: IMG.hoodieModel,
    types: ["Hoodies", "Zip Hoodies", "Sweatshirts", "Crewneck Sweatshirts", "Graphic Hoodies", "Oversized Hoodies"],
  },
  {
    slug: "knitwear",
    name: "Knitwear",
    title: "Sweaters & Knitwear",
    group: "Topwear",
    description: "Merino, cashmere blends and textured cotton knits — quiet warmth with structure.",
    image: IMG.manPortraitKnit,
    types: ["Crew Neck Sweaters", "V-Neck Sweaters", "Cardigans", "Polo Knits", "Half-Zip Knits", "Turtlenecks", "Knitted Shirts"],
  },
  {
    slug: "jackets",
    name: "Jackets",
    title: "Men's Jackets",
    group: "Topwear",
    description: "Suede, leather, denim and technical cottons. Outer layers built to be worn for a decade.",
    image: IMG.manSuedeStreet,
    types: ["Bomber Jackets", "Denim Jackets", "Leather Jackets", "Varsity Jackets", "Harrington Jackets", "Puffer Jackets", "Utility Jackets", "Windbreakers", "Suede Jackets"],
  },
  {
    slug: "blazers-suiting",
    name: "Blazers & Suiting",
    title: "Blazers & Suiting",
    group: "Topwear",
    description: "Modern tailoring with a softer shoulder and a sharper line. Cut for movement, finished by hand.",
    image: IMG.walkSuit,
    types: ["Blazers", "Casual Blazers", "Formal Blazers", "Suit Jackets", "Waistcoats", "Full Suits"],
  },
  {
    slug: "coats",
    name: "Coats",
    title: "Men's Coats",
    group: "Topwear",
    description: "Overcoats and trench coats in wool and cotton gabardine — the final word on any outfit.",
    image: IMG.coatWalk,
    types: ["Overcoats", "Trench Coats", "Wool Coats", "Long Coats"],
  },
  {
    slug: "occasionwear",
    name: "Ethnic & Occasionwear",
    title: "Ethnic & Occasionwear",
    group: "Occasionwear",
    description: "Nehru jackets, kurtas and ceremony tailoring — heritage silhouettes, modern restraint.",
    image: IMG.manWaistcoat,
    types: ["Kurtas", "Kurta Sets", "Nehru Jackets", "Occasion Shirts", "Wedding Edit", "Festive Edit"],
  },
];

/** Virtual groupings that aggregate multiple categories. */
export const categoryGroups: Record<string, { name: string; title: string; description: string; image: string; categories: string[] }> = {
  clothing: {
    name: "Clothing",
    title: "Men's Clothing",
    description: "Tees, shirts, knitwear, outerwear and tailoring — every piece designed with intention and worn without effort.",
    image: IMG.rackNeutral,
    categories: ["t-shirts", "shirts", "polos", "sweatshirts-hoodies", "knitwear", "jackets", "blazers-suiting", "coats", "occasionwear"],
  },
  topwear: {
    name: "Topwear",
    title: "Men's Topwear",
    description: "Tees, shirts, knitwear and outer layers.",
    image: IMG.shirtsTrio,
    categories: ["t-shirts", "shirts", "polos", "sweatshirts-hoodies", "knitwear", "jackets", "blazers-suiting", "coats"],
  },
  "designer-wear": {
    name: "Designer Wear",
    title: "Designer Wear",
    description: "Half-canvassed tailoring, three-piece suits and Nehru jackets in wool, silk and flannel — our most considered pieces, made in limited runs for the moments that matter.",
    image: IMG.walkSuit,
    categories: ["blazers-suiting", "occasionwear"],
  },
};

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function slugifyType(t: string) {
  return t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
