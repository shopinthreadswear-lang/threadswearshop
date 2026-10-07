import { IMG } from "./images";

/** "What we make" — each line of the wardrobe explained in plain language. */
export const WARDROBE = [
  {
    id: "t-shirts",
    name: "T-Shirts",
    href: "/men/t-shirts",
    categories: ["t-shirts"],
    image: IMG.teeBlackModel2,
    what: "Heavyweight and Supima cotton tees in five fits, from slim to oversized.",
    helps: "Denser cotton holds its shape and colour, so the tee you buy stays the tee you love.",
    outcome: "A T-shirt that still looks new after a year of weekly wear.",
    materials: "240 GSM jersey · Supima cotton · slub cotton",
  },
  {
    id: "shirts",
    name: "Shirts",
    href: "/men/shirts",
    categories: ["shirts"],
    image: IMG.manWhiteShirt,
    what: "Oxford, poplin, linen and brushed overshirts, cut with a precise collar.",
    helps: "Every cloth has a job: oxford for everyday, poplin under tailoring, linen for heat, wool-blend for layering.",
    outcome: "The right shirt for every situation in your week.",
    materials: "Two-ply oxford · 120s poplin · European linen",
  },
  {
    id: "knitwear",
    name: "Knitwear & Polos",
    href: "/men/knitwear",
    categories: ["knitwear", "polos", "sweatshirts-hoodies"],
    image: IMG.manPortraitKnit,
    what: "Merino crews, knitted polos, shawl cardigans and heavyweight sweatshirts.",
    helps: "Fine wool regulates temperature, so you stay comfortable from an air-conditioned office to a winter evening.",
    outcome: "Warmth without bulk — and knitwear smart enough to wear under a blazer.",
    materials: "Extra-fine merino · lambswool · loopback cotton",
  },
  {
    id: "outerwear",
    name: "Outerwear",
    href: "/men/jackets",
    categories: ["jackets", "coats"],
    image: IMG.suedeJacket,
    what: "Suede, leather, selvedge denim, waxed cotton and wool-cashmere coats.",
    helps: "Built from materials that age well, with construction that can be repaired rather than replaced.",
    outcome: "An outer layer you will still be wearing in ten years.",
    materials: "Goat suede · lambskin · Biella wool-cashmere",
  },
  {
    id: "designer",
    name: "Designer Wear",
    href: "/men/designer-wear",
    categories: ["blazers-suiting", "occasionwear"],
    image: IMG.blazerDB,
    what: "Half-canvassed blazers, three-piece suits and Nehru jackets.",
    helps: "A canvassed chest moulds to your body with wear, and every suit includes complimentary alterations.",
    outcome: "Tailoring for interviews, weddings and every day that matters.",
    materials: "Super 120s wool · wool flannel · wool-silk",
  },
];

/** How a piece is made — the process timeline. */
export const PROCESS = [
  { n: "01", title: "Source", image: IMG.linenFabric, text: "We buy cloth only from mills we have visited — Supima cotton from the USA, flax from Normandy, wool from Biella.", detail: "Traceable, small-batch fabric" },
  { n: "02", title: "Design", image: IMG.shirtsCloseup, text: "Every pattern is fitted on real bodies across six sizes in our Mumbai studio. Most pieces take ten or more samples.", detail: "Fitted on six body types" },
  { n: "03", title: "Make", image: IMG.tailoring, text: "Cut and sewn by eleven family-run workshops in Tiruppur, Ludhiana and Chennai — partners we have worked with for years.", detail: "11 named workshops" },
  { n: "04", title: "Inspect", image: IMG.knitHanging, text: "A 21-point check: seams, measurements, buttons, shade and finish. Anything that falls short never leaves the studio.", detail: "21-point inspection" },
  { n: "05", title: "Pack", image: IMG.packaging, text: "Folded around a card, wrapped in acid-free tissue and boxed by hand in a matte black box with a handwritten note.", detail: "Plastic-free packaging" },
  { n: "06", title: "Deliver", image: IMG.manCasualSeated, text: "Dispatched within 24 hours. With you in 2–4 days in metro cities, tracked at every step — and free to return for 15 days.", detail: "Dispatched in 24 hours" },
];

/** Differentiators, each backed by a fact. */
export const EVIDENCE = [
  { metric: "240", unit: "GSM", title: "Heavier, denser cloth.", text: "Our Mercer tee is 240 GSM; most high-street tees sit between 160 and 180. The extra weight is why it drapes, doesn’t twist at the seams and doesn’t turn sheer." },
  { metric: "11", unit: "workshops", title: "Makers we can name.", text: "Family-run workshops, not anonymous factories. We visit each one, and every label tells you where your piece was made." },
  { metric: "21", unit: "checks", title: "Inspected by hand.", text: "Seams, measurements, buttons, shade and finish are checked on every single piece before it is packed — not on a sample." },
  { metric: "15", unit: "days", title: "Returns without friction.", text: "Fifteen days to decide, free doorstep pickup and refunds within 5–7 working days — or instantly as store credit." },
  { metric: "24", unit: "hours", title: "Fast, tracked delivery.", text: "Dispatched from Mumbai within a day. Two to four days to metro cities, with live tracking from packing to your door." },
];

export const STORY_REVIEWS = [
  { quote: "The Mercer is the best heavyweight tee I’ve owned — and I’ve tried them all. After six months it still looks new.", author: "Rohan M.", city: "Mumbai", role: "Architect", product: "The Mercer Heavyweight Tee", slug: "mercer-heavyweight-tee", image: IMG.teeBlackHanger, result: "Went back for two more colours" },
  { quote: "Packaging and finishing felt truly premium. It felt like opening something from a Milanese atelier — at a fraction of the price.", author: "Karthik S.", city: "Bengaluru", role: "Product Manager", product: "The Kensington Oxford Shirt", slug: "kensington-oxford-shirt", image: IMG.oxfordFlat, result: "Now his everyday work shirt" },
  { quote: "The suede is unreal. Soft, rich colour, and it fits like it was cut for me. Worth every rupee of the investment.", author: "Arnav K.", city: "Gurugram", role: "Founder", product: "The Mayfair Suede Jacket", slug: "mayfair-suede-jacket", image: IMG.suedeJacket, result: "Worn three times a week this winter" },
  { quote: "I wore the Windsor three-piece to my brother’s wedding. The alterations were free and it fit perfectly on the day.", author: "Siddharth T.", city: "Chennai", role: "Consultant", product: "The Windsor Check Three-Piece", slug: "windsor-check-three-piece", image: IMG.suitCheck, result: "Fitted within a week, alterations included" },
];

/** Hero sequence — real people in real pieces, so a first-time visitor sees what we make and how it looks on. */
export const HERO_LOOKS = [
  { id: "outerwear", category: "Outerwear", href: "/men/jackets", image: IMG.manSuedeStreet, focus: "50% 30%", colour: "Tobacco", pieces: ["mayfair-suede-jacket", "mercer-heavyweight-tee"] },
  { id: "shirts", category: "Shirts", href: "/men/shirts", image: IMG.manWhiteShirt, focus: "50% 25%", colour: "Optic White", pieces: ["kensington-oxford-shirt"] },
  { id: "tees", category: "T-Shirts", href: "/men/t-shirts", image: IMG.teeBlackModel2, focus: "50% 30%", colour: "Onyx Black", pieces: ["mercer-heavyweight-tee"] },
  { id: "designer", category: "Designer Wear", href: "/men/designer-wear", image: IMG.walkSuit, focus: "50% 25%", colour: "Midnight Navy", pieces: ["savoy-two-piece-suit", "savile-poplin-shirt"] },
  { id: "knitwear", category: "Knitwear", href: "/men/knitwear", image: IMG.manPortraitKnit, focus: "50% 35%", colour: "Moss Marl", pieces: ["aldwych-shawl-cardigan"] },
  { id: "blazers", category: "Blazers", href: "/men/blazers-suiting", image: IMG.blazerDB, focus: "50% 30%", colour: "Onyx Black", pieces: ["belgravia-double-breasted-blazer"] },
];

/** The anatomy of a shirt — annotated on a real photograph (coordinates are fractions of the image). */
export const ANATOMY = {
  image: IMG.shirtFormalTie,
  product: "savile-poplin-shirt",
  details: [
    { n: "01", title: "The Collar", short: "Semi-spread, removable stays", x: 0.565, y: 0.085, note: "Cut to frame a tie knot or sit open on its own. Lightly fused, so it holds a clean line without feeling like cardboard.", spec: "Removable brass stays" },
    { n: "02", title: "The Shoulder", short: "Split yoke, cut on the bias", x: 0.735, y: 0.14, note: "A two-piece yoke follows the slope of each shoulder independently, so the back sits flat instead of pulling.", spec: "Split yoke · 18 stitches per inch" },
    { n: "03", title: "The Cloth", short: "120s two-fold poplin", x: 0.355, y: 0.3, note: "Two fine yarns twisted into one: smooth and cool against the skin, and noticeably slower to crease than single-ply shirting.", spec: "100% cotton · two-fold 120s" },
    { n: "04", title: "The Sleeve", short: "Slim from elbow to wrist", x: 0.775, y: 0.47, note: "Patterned narrower through the forearm so the sleeve sits close under a jacket instead of bunching at the cuff.", spec: "Two sleeve pleats at the cuff" },
    { n: "05", title: "The Waist", short: "Tailored, not tight", x: 0.64, y: 0.72, note: "Twin darts at the back take in the waist; the front stays clean, so it tucks in without billowing over your belt.", spec: "Twin back darts" },
    { n: "06", title: "The Cuff", short: "Mitred, two-button adjustable", x: 0.8, y: 0.865, note: "Angled corners and a second button let you set the cuff snug — or loose enough to sit over a watch.", spec: "Adjustable two-button cuff" },
  ],
};
