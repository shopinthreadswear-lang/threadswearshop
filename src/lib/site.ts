export const site = {
  name: "THREADS WARE",
  shortName: "Threads Ware",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.threadsware.in").replace(/\/$/, ""),
  description: "Premium menswear designed in Mumbai. Elevated essentials, precise tailoring and considered outerwear — made for modern men.",
  email: "care@threadsware.in",
  phone: "+91 22 4890 2026",
  phoneHref: "tel:+912248902026",
  whatsapp: "+91 98200 26026",
  whatsappHref: "https://wa.me/919820026026",
  hours: "Monday – Saturday, 10am – 8pm IST",
  address: { line1: "Threads Ware Studio, 4th Floor, Kamala Mills", line2: "Senapati Bapat Marg, Lower Parel", city: "Mumbai", state: "Maharashtra", pincode: "400013", country: "India" },
  gstin: "27AAKCT2026R1Z5",
  social: {
    instagram: "https://www.instagram.com/threadsware",
    youtube: "https://www.youtube.com/@threadsware",
    pinterest: "https://www.pinterest.com/threadsware",
    facebook: "https://www.facebook.com/threadsware",
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

export const formatINR = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
