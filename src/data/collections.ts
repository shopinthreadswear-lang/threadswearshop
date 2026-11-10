import type { Collection } from "@/lib/types";
import { IMG } from "./images";

export const collections: Collection[] = [
  {
    slug: "signature",
    name: "The Signature Collection",
    tagline: "Modern tailoring meets effortless everyday luxury.",
    description: "The pieces that define Threads Wear — a suede jacket cut close to the body, a half-canvassed blazer with a soft shoulder, an oxford shirt with a collar that holds its line. Made in limited runs from the finest materials we source.",
    image: IMG.manSuedeStreet,
    secondaryImage: IMG.suedeJacket,
  },
  {
    slug: "essentials",
    name: "The Essentials",
    tagline: "Premium materials. Precise proportions. Effortless dressing.",
    description: "The everyday uniform, perfected. Heavyweight tees, oxford shirts and merino knits you will reach for every morning — and keep for years.",
    image: IMG.teeWhiteModel2,
    secondaryImage: IMG.teesFolded,
  },
  {
    slug: "new-season",
    name: "New Season",
    tagline: "Autumn / Winter 2026.",
    description: "Deeper tones, heavier cloths and softer structure. The new season arrives in tobacco suede, olive cotton twill and brushed merino.",
    image: IMG.manBrownJacket,
    secondaryImage: IMG.utilityOlive,
  },
  {
    slug: "modern-tailoring",
    name: "Modern Tailoring",
    tagline: "Quiet confidence, cut into every silhouette.",
    description: "Half-canvassed blazers, three-piece suits and crisp poplin shirts. Tailoring that fits the way modern men actually live.",
    image: IMG.walkSuit,
    secondaryImage: IMG.blazerDB,
  },
  {
    slug: "weekend-uniform",
    name: "Weekend Uniform",
    tagline: "Modern essentials made for wherever the day takes you.",
    description: "Overshirts, loopback crews and denim jackets — easy pieces with an elevated finish.",
    image: IMG.manDenimJacket,
    secondaryImage: IMG.overshirtModel,
  },
  {
    slug: "resort",
    name: "The Resort Edit",
    tagline: "Sun-washed linen. Unhurried days.",
    description: "Garment-washed linen shirts, knitted polos and Breton tees for long lunches, coastal evenings and everything in between.",
    image: IMG.manWhiteOutfit,
    secondaryImage: IMG.sunglasses,
  },
  {
    slug: "monochrome",
    name: "The Monochrome Edit",
    tagline: "Black, white and everything in between.",
    description: "A study in restraint. Onyx tees, optic white shirts and charcoal tailoring that pair without thought.",
    image: IMG.teeBlackModel2,
    secondaryImage: IMG.blazerBlack,
  },
  {
    slug: "after-dark",
    name: "After Dark",
    tagline: "All-day comfort. After-dark presence.",
    description: "Leather, black tailoring and fine knits for evenings that matter.",
    image: IMG.blackSuitStreet,
    secondaryImage: IMG.leatherModel,
  },
  {
    slug: "winter-layers",
    name: "Winter Layers",
    tagline: "Warmth, without the weight.",
    description: "Overcoats, merino knits and brushed overshirts designed to layer with intent.",
    image: IMG.coatWalk,
    secondaryImage: IMG.manBeanieScarf,
  },
  {
    slug: "limited-edition",
    name: "Limited Edition",
    tagline: "Made once. Numbered. Never restocked.",
    description: "Small-batch pieces in exceptional materials. Each is numbered by hand and produced in a single run.",
    image: IMG.manTweed,
    secondaryImage: IMG.watchBlack,
  },
  {
    slug: "wedding-edit",
    name: "The Wedding Edit",
    tagline: "For the groom, the best man and every guest worth remembering.",
    description: "Three-piece suits, Nehru jackets and ceremony shirts — tailored for the season's most important days.",
    image: IMG.suitCheck,
    secondaryImage: IMG.manWaistcoat,
  },
  {
    slug: "workwear",
    name: "Workwear",
    tagline: "Monday to Friday, considered.",
    description: "Shirts, knitwear and blazers built for long days and sharp first impressions.",
    image: IMG.shirtBlueModel,
    secondaryImage: IMG.shirtFormalTie,
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}
