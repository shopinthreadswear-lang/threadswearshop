import { IMG } from "@/data/images";

/**
 * Site copy and photos the admin can edit (Admin → Site content).
 *
 * These objects hold the live values. They start as the defaults below and `applyCatalog` (src/lib/catalog.ts)
 * overwrites them in place with the admin's saved content, on the server and in the browser, so components just
 * import and read them.
 */

export type HeroSlide = {
  img: string;
  alt: string;
  /** Small line above the title. */
  tag: string;
  line1: string;
  line2: string;
  /** Product whose price shows in the round tag ("" = no tag). */
  productSlug: string;
  href: string;
  button: string;
  /** CSS object-position, e.g. "50% 30%". */
  focus: string;
};

export type HomeContent = {
  hero: HeroSlide[];
  promises: { title: string; text: string }[];
  shelf: { title: string; accent: string; sub: string };
  fresh: { title: string; accent: string; sub: string };
  story: { eyebrow: string; title: string; accent: string; body: string; button: string; href: string; img1: string; img2: string; badge: string };
};

export type ContactContent = {
  email: string;
  phone: string;
  whatsapp: string;
  hours: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  instagram: string;
  facebook: string;
  youtube: string;
  pinterest: string;
};

export type SiteContent = { home?: HomeContent; contact?: ContactContent };

export const DEFAULT_HOME: HomeContent = {
  hero: [
    { img: IMG.teeWhiteModel2, alt: "Man in a white crew-neck tee against a warm wall", focus: "50% 30%", tag: "Supima cotton for every day", line1: "Everyday", line2: "collection", productSlug: "arden-supima-crew", href: "/men/t-shirts", button: "Shop collection" },
    { img: IMG.teeCharcoalModel, alt: "Man in a charcoal heavyweight tee and jeans", focus: "50% 30%", tag: "Heavyweight cotton, cut in Mumbai", line1: "Heavyweight", line2: "collection", productSlug: "mercer-heavyweight-tee", href: "/men/t-shirts", button: "Shop collection" },
    { img: IMG.manWhiteShirt, alt: "Man in a crisp white shirt and sunglasses", focus: "50% 25%", tag: "Oxford and poplin, pressed and ready", line1: "Shirting", line2: "collection", productSlug: "kensington-oxford-shirt", href: "/men/shirts", button: "Shop collection" },
  ],
  promises: [
    { title: "Free shipping", text: "On every order over {freeShipping}" },
    { title: "Secure payment", text: "UPI, cards and cash on delivery" },
    { title: "Cut in Mumbai", text: "Every piece checked by hand" },
    { title: "{returnDays}-day returns", text: "Free pickup from your door" },
  ],
  shelf: { title: "Not-so-ordinary", accent: "shirts & tees", sub: "Our best sellers — the pieces customers come back for." },
  fresh: { title: "Fresh off the", accent: "cutting table", sub: "New this season, in small runs." },
  story: {
    eyebrow: "Our story",
    title: "Dressed for every",
    accent: "table",
    body: "We make clothes for the moments that bring people together — long Sunday lunches, loud weddings, early Mondays and everything in between. Shirts, tees and tailoring that are easy to wear, cut with care and made to stay in your life for years.",
    button: "Our story",
    href: "/our-story",
    img1: IMG.manCasualSeated,
    img2: IMG.manWindow,
    badge: "Since 2021",
  },
};

/** Live homepage content. Mutated in place by applyCatalog — never reassign. */
export const home: HomeContent = structuredClone(DEFAULT_HOME);
