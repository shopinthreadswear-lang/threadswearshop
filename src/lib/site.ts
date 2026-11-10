export const site = {
  name: "THREADS WEAR",
  shortName: "Threads Wear",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.threadswears.com").replace(/\/$/, ""),
  description: "Premium menswear designed in Mumbai. Elevated essentials, precise tailoring and considered outerwear — made for modern men.",
  email: "shopinthreadswear@gmail.com",
  phone: "+91 22 4890 2026",
  phoneHref: "tel:+912248902026",
  whatsapp: "+91 98200 26026",
  whatsappHref: "https://wa.me/919820026026",
  hours: "Monday – Saturday, 10am – 8pm IST",
  address: { line1: "Threads Wear Studio, 4th Floor, Kamala Mills", line2: "Senapati Bapat Marg, Lower Parel", city: "Mumbai", state: "Maharashtra", pincode: "400013", country: "India" },
  gstin: "27AAKCT2026R1Z5",
  social: {
    instagram: "https://www.instagram.com/threadswear",
    youtube: "https://www.youtube.com/@threadswear",
    pinterest: "https://www.pinterest.com/threadswear",
    facebook: "https://www.facebook.com/threadswear",
  },
};

export const commerce = {
  freeShippingThreshold: 2999,
  standardShipping: 149,
  expressShipping: 349,
  codFee: 49,
  codLimit: 10000,
  gstRate: 0.12, // blended apparel GST; prices are GST inclusive
  returnWindowDays: 15,
};

/** Rotating messages in the top bar. Admin-editable (see src/lib/catalog.ts). */
export const announcements: { text: string; href: string }[] = [
  { text: "Complimentary shipping on orders above ₹2,999", href: "/shipping" },
  { text: "Easy 15-day returns & free exchanges", href: "/returns" },
  { text: "Secure payments · UPI, cards, net banking & COD", href: "/faq#payments" },
  { text: "The Autumn / Winter ’26 collection is here", href: "/collections/new-season" },
];

export const formatINR = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
