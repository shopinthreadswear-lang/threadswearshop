import { categories, slugifyType } from "./categories";
import { IMG } from "./images";

export const megaMenu = {
  topwear: [
    { title: "T-Shirts", slug: "t-shirts" },
    { title: "Shirts", slug: "shirts" },
    { title: "Sweatshirts & Hoodies", slug: "sweatshirts-hoodies" },
    { title: "Sweaters & Knitwear", slug: "knitwear" },
    { title: "Jackets", slug: "jackets" },
    { title: "Blazers & Suiting", slug: "blazers-suiting" },
    { title: "Coats", slug: "coats" },
  ].map((g) => ({ ...g, types: categories.find((c) => c.slug === g.slug)!.types })),
  more: [
    { title: "Designer Wear", slug: "designer-wear", items: [["All Designer Wear", "/men/designer-wear"], ["Blazers", "/men/blazers-suiting?type=blazers"], ["Formal Blazers", "/men/blazers-suiting?type=formal-blazers"], ["Casual Blazers", "/men/blazers-suiting?type=casual-blazers"], ["Full Suits", "/men/blazers-suiting?type=full-suits"], ["Waistcoats", "/men/blazers-suiting?type=waistcoats"], ["Nehru Jackets", "/men/occasionwear?type=nehru-jackets"], ["Wedding Edit", "/collections/wedding-edit"], ["Limited Edition", "/collections/limited-edition"]] },
    { title: "Ethnic & Occasionwear", slug: "occasionwear", items: categories.find((c) => c.slug === "occasionwear")!.types.map((t) => [t, `/men/occasionwear?type=${slugifyType(t)}`]) },
  ] as { title: string; slug: string; items: [string, string][] }[],
  edits: [
    ["New Season", "/collections/new-season"],
    ["Best Sellers", "/best-sellers"],
    ["Trending", "/trending"],
    ["Limited Edition", "/collections/limited-edition"],
    ["Premium Collection", "/collections/signature"],
    ["Essentials", "/collections/essentials"],
    ["Workwear", "/collections/workwear"],
    ["Weekend", "/collections/weekend-uniform"],
    ["Vacation Edit", "/collections/resort"],
    ["Wedding Edit", "/collections/wedding-edit"],
  ] as [string, string][],
  campaign: [
    { title: "The Signature Collection", href: "/collections/signature", image: IMG.manSuedeStreet, eyebrow: "Campaign" },
    { title: "Modern Tailoring", href: "/collections/modern-tailoring", image: IMG.blazerDB, eyebrow: "The Edit" },
  ],
};

export const footerNav = {
  Shop: [
    ["New Arrivals", "/new-arrivals"],
    ["T-Shirts", "/men/t-shirts"],
    ["Shirts", "/men/shirts"],
    ["Knitwear", "/men/knitwear"],
    ["Outerwear", "/men/jackets"],
    ["Designer Wear", "/men/designer-wear"],
    ["Sale", "/sale"],
  ],
  Help: [
    ["Contact Us", "/contact"],
    ["FAQ", "/faq"],
    ["Shipping", "/shipping"],
    ["Returns", "/returns"],
    ["Size Guide", "/size-guide"],
    ["Track Order", "/track-order"],
  ],
  About: [
    ["Our Story", "/our-story"],
    ["About Threads Wear", "/about"],
    ["Journal", "/journal"],
    ["Careers", "/careers"],
    ["Stores", "/stores"],
    ["Sustainability", "/about#materials"],
  ],
  Legal: [
    ["Privacy Policy", "/privacy"],
    ["Terms & Conditions", "/terms"],
    ["Cookie Policy", "/cookies"],
  ],
} as Record<string, [string, string][]>;
