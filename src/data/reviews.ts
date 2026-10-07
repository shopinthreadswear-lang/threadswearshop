import type { Product, Review } from "@/lib/types";
import { IMG } from "./images";

const AUTHORS = [
  ["Rohan M.", "Mumbai"],
  ["Karthik S.", "Bengaluru"],
  ["Aditya R.", "Pune"],
  ["Vikram P.", "New Delhi"],
  ["Nikhil J.", "Hyderabad"],
  ["Arnav K.", "Gurugram"],
  ["Siddharth T.", "Chennai"],
  ["Rahul D.", "Kolkata"],
  ["Imran Q.", "Lucknow"],
  ["Dev A.", "Ahmedabad"],
  ["Kabir L.", "Goa"],
  ["Pranav N.", "Kochi"],
  ["Aman G.", "Chandigarh"],
  ["Varun B.", "Jaipur"],
];

const TEMPLATES: { title: string; body: string; rating: number; fit: Review["fit"] }[] = [
  { title: "Exceptional fabric quality and fit.", body: "You can feel the difference the moment you pick it up — the fabric has real weight to it and the stitching is immaculate. Fits exactly as described. Already ordered a second colour.", rating: 5, fit: "True to size" },
  { title: "Packaging and finishing felt truly premium.", body: "Arrived in a matte black box wrapped in tissue with a handwritten card. Small touch, but it set the tone. The piece itself is beautifully finished, inside and out.", rating: 5, fit: "True to size" },
  { title: "Better than brands charging three times more.", body: "I've bought from a couple of international labels and honestly this holds up better after a dozen washes. The colour hasn't faded and the shape is intact.", rating: 5, fit: "True to size" },
  { title: "Size up if you're between sizes", body: "Quality is excellent, but the cut is on the trimmer side across the shoulders. I exchanged for one size up — the process was quick and pickup was arranged the next day.", rating: 4, fit: "Runs small" },
  { title: "My new everyday staple", body: "Wore it to the office, to dinner and on a weekend trip. Works with everything. The fit through the body is clean without being tight.", rating: 5, fit: "True to size" },
  { title: "Fast delivery, great communication", body: "Delivered in two days to Bengaluru with tracking updates at every step. The product matches the photos exactly.", rating: 5, fit: "True to size" },
  { title: "Lovely piece, slightly roomy", body: "Generous fit — which I like for this style — but if you prefer a closer fit consider sizing down. The material feels expensive.", rating: 4, fit: "Runs large" },
  { title: "Worth every rupee", body: "Was hesitant about the price, but after a month of wear I get it. Details like the buttons and the inside seams are things you only notice on genuinely well-made clothes.", rating: 5, fit: "True to size" },
  { title: "Great quality, colour slightly different", body: "Colour is a touch warmer in person than on my screen, but honestly I prefer it. Construction is excellent.", rating: 4, fit: "True to size" },
  { title: "Compliments every time", body: "Simple, but people notice. The proportions are just right — that's hard to find.", rating: 5, fit: "True to size" },
];

const DATES = ["2026-09-28", "2026-09-19", "2026-09-07", "2026-08-30", "2026-08-14", "2026-07-26", "2026-07-02", "2026-06-15", "2026-05-21", "2026-04-09"];

function h(s: string) {
  let x = 0;
  for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(x);
}

/** Deterministic seeded reviews for each product (real reviews are appended from the store). */
export function seededReviews(p: Product): Review[] {
  const count = Math.min(8, Math.max(4, Math.round(p.reviewCount / 15)));
  const start = h(p.slug) % TEMPLATES.length;
  return Array.from({ length: count }, (_, i) => {
    let t = TEMPLATES[(start + i) % TEMPLATES.length];
    if (p.rating >= 4.85 && t.rating < 5) t = TEMPLATES[0];
    const [author, location] = AUTHORS[(h(p.slug) + i * 3) % AUTHORS.length];
    const size = p.sizes[Math.min(p.sizes.length - 1, 2 + (i % 2))];
    return {
      id: `${p.id}_r${i}`,
      productId: p.id,
      author,
      location,
      rating: t.rating,
      title: t.title,
      body: t.body,
      fit: p.fit === "One Size" ? "True to size" : t.fit,
      quality: t.rating === 5 ? 5 : 4,
      sizePurchased: size,
      verified: true,
      date: DATES[i % DATES.length],
      images: i === 1 ? [IMG.packaging] : i === 2 && p.images[1] ? [p.images[1]] : undefined,
      helpful: (h(p.slug + i) % 24) + 1,
    };
  });
}

/** Homepage social proof — curated, attributed to specific products. */
export const featuredReviews = [
  { quote: "Exceptional fabric quality and fit. The Mercer is the best heavyweight tee I've owned — and I've tried them all.", author: "Rohan M.", city: "Mumbai", product: "The Mercer Heavyweight Tee", slug: "mercer-heavyweight-tee" },
  { quote: "Packaging and finishing felt truly premium. It felt like opening something from a Milanese atelier.", author: "Karthik S.", city: "Bengaluru", product: "The Kensington Oxford Shirt", slug: "kensington-oxford-shirt" },
  { quote: "The suede is unreal. Soft, rich colour and it fits like it was cut for me. Worth the investment.", author: "Arnav K.", city: "Gurugram", product: "The Mayfair Suede Jacket", slug: "mayfair-suede-jacket" },
  { quote: "Exchanged a size within two days — no questions, pickup from home. That's how you earn a repeat customer.", author: "Siddharth T.", city: "Chennai", product: "The Kensington Oxford Shirt", slug: "kensington-oxford-shirt" },
];
