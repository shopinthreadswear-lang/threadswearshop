/**
 * Fabric presets — drive both the WebGL material and the explanatory copy.
 * Physical values are tuned for three.js MeshPhysicalMaterial's cloth "sheen" model.
 */
export type Weave = "jersey" | "oxford" | "poplin" | "linen" | "knit" | "suede" | "twill" | "hopsack";

export type FabricPreset = {
  id: string;
  name: string;
  short: string;
  color: string;
  sheenColor: string;
  sheen: number;
  sheenRoughness: number;
  roughness: number;
  weave: Weave;
  weaveRepeat: number; // texture repeats across the cloth
  normalStrength: number;
  amplitude: number; // fold depth
  speed: number; // idle motion speed
  // Copy — plain language, no industry knowledge assumed
  what: string;
  helps: string;
  outcome: string;
  spec: string;
  usedIn: { label: string; href: string }[];
};

export const FABRICS: FabricPreset[] = [
  {
    id: "jersey",
    name: "Heavyweight Jersey",
    short: "Jersey",
    color: "#1c1c1d",
    sheenColor: "#8e8a84",
    sheen: 0.55,
    sheenRoughness: 0.55,
    roughness: 0.86,
    weave: "jersey",
    weaveRepeat: 26,
    normalStrength: 0.55,
    amplitude: 0.62,
    speed: 0.9,
    what: "A dense, knitted cotton — the cloth our T-shirts are made from.",
    helps: "At 240 GSM it’s around a third heavier than a typical high-street tee, so it drapes instead of clinging and doesn’t turn see-through.",
    outcome: "A T-shirt that keeps its collar and shape wash after wash.",
    spec: "100% combed cotton · 240 GSM · enzyme washed",
    usedIn: [
      { label: "The Mercer Heavyweight Tee", href: "/products/mercer-heavyweight-tee" },
      { label: "All T-Shirts", href: "/men/t-shirts" },
    ],
  },
  {
    id: "oxford",
    name: "Two-Ply Oxford",
    short: "Oxford",
    color: "#c7d3e0",
    sheenColor: "#ffffff",
    sheen: 0.35,
    sheenRoughness: 0.6,
    roughness: 0.78,
    weave: "oxford",
    weaveRepeat: 30,
    normalStrength: 0.7,
    amplitude: 0.5,
    speed: 0.8,
    what: "A basket-woven cotton with a soft, slightly textured face.",
    helps: "Two yarns twisted together make it tougher than ordinary shirting, and the texture hides creases through a long day.",
    outcome: "A shirt smart enough for work and relaxed enough for the weekend.",
    spec: "100% two-ply cotton · brushed finish",
    usedIn: [
      { label: "The Kensington Oxford Shirt", href: "/products/kensington-oxford-shirt" },
      { label: "All Shirts", href: "/men/shirts" },
    ],
  },
  {
    id: "linen",
    name: "European Linen",
    short: "Linen",
    color: "#a8b29b",
    sheenColor: "#e9e4d6",
    sheen: 0.4,
    sheenRoughness: 0.7,
    roughness: 0.92,
    weave: "linen",
    weaveRepeat: 18,
    normalStrength: 0.9,
    amplitude: 0.7,
    speed: 0.7,
    what: "Woven from flax grown in Normandy and Belgium, washed for softness.",
    helps: "Linen breathes and dries faster than cotton — the coolest thing you can wear in an Indian summer.",
    outcome: "A shirt that stays comfortable at 35°C and looks better the more it’s worn.",
    spec: "100% European flax · garment washed",
    usedIn: [
      { label: "The Portofino Linen Shirt", href: "/products/portofino-linen-shirt" },
      { label: "The Resort Edit", href: "/collections/resort" },
    ],
  },
  {
    id: "merino",
    name: "Extra-Fine Merino",
    short: "Merino",
    color: "#5b2a28",
    sheenColor: "#c99a8c",
    sheen: 0.8,
    sheenRoughness: 0.6,
    roughness: 0.9,
    weave: "knit",
    weaveRepeat: 20,
    normalStrength: 0.8,
    amplitude: 0.55,
    speed: 0.75,
    what: "A fine wool knit, finer than a human hair (18.5 microns).",
    helps: "Merino regulates temperature and resists odour, so one sweater works from a cold office to a winter evening — without the itch.",
    outcome: "Warmth without bulk, and knitwear that layers under a blazer.",
    spec: "100% extra-fine merino · 12-gauge knit",
    usedIn: [
      { label: "The Hampton Merino Crew", href: "/products/hampton-merino-crew" },
      { label: "All Knitwear", href: "/men/knitwear" },
    ],
  },
  {
    id: "suede",
    name: "Goat Suede",
    short: "Suede",
    color: "#6f4426",
    sheenColor: "#d9a675",
    sheen: 1,
    sheenRoughness: 0.32,
    roughness: 0.97,
    weave: "suede",
    weaveRepeat: 6,
    normalStrength: 0.35,
    amplitude: 0.6,
    speed: 0.6,
    what: "The brushed inner side of goatskin, tanned in Chennai.",
    helps: "Lighter and softer than leather, with a velvety nap that catches light — it breaks in rather than wears out.",
    outcome: "An outer layer that looks better in year five than in week one.",
    spec: "Hand-selected goat suede · cupro lining",
    usedIn: [
      { label: "The Mayfair Suede Jacket", href: "/products/mayfair-suede-jacket" },
      { label: "All Jackets", href: "/men/jackets" },
    ],
  },
  {
    id: "wool",
    name: "Tailoring Wool",
    short: "Wool",
    color: "#1f2738",
    sheenColor: "#8b97b4",
    sheen: 0.6,
    sheenRoughness: 0.45,
    roughness: 0.82,
    weave: "hopsack",
    weaveRepeat: 34,
    normalStrength: 0.6,
    amplitude: 0.45,
    speed: 0.7,
    what: "Super 120s wool and open-weave hopsack for our blazers and suits.",
    helps: "Fine wool resists wrinkles and recovers overnight; the open weave lets tailoring breathe in warm climates.",
    outcome: "A blazer that holds a sharp line from the first meeting to the last dinner.",
    spec: "Super 120s Italian wool · half-canvassed",
    usedIn: [
      { label: "The Belgravia Double-Breasted Blazer", href: "/products/belgravia-double-breasted-blazer" },
      { label: "Designer Wear", href: "/men/designer-wear" },
    ],
  },
];

/** Map a product's materials to the closest fabric preset (used on product pages). */
export function fabricForMaterial(materials: string): FabricPreset {
  const m = materials.toLowerCase();
  if (m.includes("suede") || m.includes("leather")) return FABRICS[4];
  if (m.includes("linen")) return FABRICS[2];
  if (m.includes("merino") || m.includes("lambswool") || (m.includes("wool") && m.includes("cotton"))) return FABRICS[3];
  if (m.includes("wool") || m.includes("silk")) return FABRICS[5];
  if (m.includes("oxford") || m.includes("poplin") || m.includes("chambray") || m.includes("dobby") || m.includes("denim") || m.includes("gabardine") || m.includes("twill")) return FABRICS[1];
  return FABRICS[0];
}
