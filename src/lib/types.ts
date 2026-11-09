export type Size = string;

export type ProductColor = {
  name: string;
  hex: string;
  /** Optional colour-specific image set; falls back to product.images */
  images?: string[];
};

export type ProductVariant = {
  sku: string;
  color: string;
  size: Size;
  stock: number;
};

export type Badge = "New" | "Bestseller" | "Limited Edition" | "Sale";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string; // category slug
  subcategory: string; // product type, e.g. "Oxford Shirts"
  collection: string[]; // collection slugs
  price: number; // INR, GST inclusive
  compareAtPrice?: number;
  currency: "INR";
  discount?: number; // percentage, derived
  images: string[]; // [primary, hover, ...gallery]
  video?: string;
  colors: ProductColor[];
  sizes: Size[];
  materials: string;
  composition: string[];
  fit: "Slim" | "Regular" | "Relaxed" | "Oversized" | "Tailored" | "One Size";
  modelInfo?: string;
  careInstructions: string[];
  features: string[];
  sku: string;
  variants: ProductVariant[];
  stock: number; // total units across variants
  tags: string[];
  badge?: Badge;
  rating: number;
  reviewCount: number;
  ratingBreakdown: { quality: number; fit: number; value: number };
  isNew: boolean;
  isBestSeller: boolean;
  isLimitedEdition: boolean;
  isTrending: boolean;
  sleeve?: "Short Sleeve" | "Long Sleeve" | "Sleeveless";
  pattern: "Solid" | "Striped" | "Checked" | "Printed" | "Textured";
  occasion: ("Everyday" | "Work" | "Weekend" | "Evening" | "Occasion" | "Travel")[];
  completeTheLook?: string[]; // product slugs
  createdAt: string;
  /** Search-engine title and description, set in the admin. */
  seoTitle?: string;
  seoDescription?: string;
};

export type Category = {
  slug: string;
  name: string;
  title: string; // listing headline, e.g. "Men's T-Shirts"
  group: "Topwear" | "Bottomwear" | "Occasionwear" | "Activewear" | "Innerwear & Loungewear" | "Footwear" | "Accessories";
  description: string;
  image: string;
  types: string[];
};

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  secondaryImage?: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  location?: string;
  rating: number;
  title: string;
  body: string;
  fit: "Runs small" | "True to size" | "Runs large";
  quality: number;
  sizePurchased: string;
  verified: boolean;
  date: string;
  images?: string[];
  helpful?: number;
  /** Moderation. Reviews without a status were published before moderation existed and count as approved. */
  status?: "pending" | "approved" | "rejected";
};

export type JournalArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  body: { type: "p" | "h2" | "quote" | "image"; text?: string; src?: string; caption?: string }[];
  products?: string[];
};

export type CartLine = {
  key: string; // productId|color|size
  productId: string;
  color: string;
  size: string;
  quantity: number;
  /** Gift-card only */
  giftCard?: { amount: number; recipient: string; recipientEmail: string; message?: string };
};

export type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
};

export type OrderStatus = "placed" | "confirmed" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "returned";

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sku: string;
};

export type Order = {
  id: string;
  accessToken: string;
  userId?: string;
  email: string;
  phone: string;
  items: OrderItem[];
  shippingAddress: Omit<Address, "id" | "label" | "isDefault">;
  delivery: { method: "standard" | "express"; label: string; eta: string };
  payment: { method: string; label: string; status: "paid" | "pending" | "cod"; reference?: string };
  totals: { subtotal: number; discount: number; shipping: number; codFee: number; tax: number; total: number };
  promoCode?: string;
  status: OrderStatus;
  timeline: { status: OrderStatus; at: string; note?: string }[];
  courier?: { name: string; trackingId: string };
  /** Money given back to the customer, recorded in the admin. */
  refunds?: { id: string; amount: number; reason: string; method: "original" | "bank" | "store_credit" | "cash"; restocked: boolean; at: string; by: string }[];
  expectedDelivery: string;
  createdAt: string;
};

export type SavedPayment =
  | { id: string; type: "card"; brand: string; last4: string; expiry: string; holder: string; isDefault?: boolean }
  | { id: string; type: "upi"; vpa: string; isDefault?: boolean };

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob?: string;
  passwordHash: string;
  createdAt: string;
  addresses: Address[];
  payments: SavedPayment[];
  wishlist: string[];
  preferences: { newsletter: boolean; sms: boolean; whatsapp: boolean; preferredSize?: string; preferredFit?: string };
  cart?: { lines: CartLine[]; updatedAt: string };
  /** Set by the admin: a blocked customer can't sign in or place orders. */
  blocked?: { at: string; reason: string };
};

export type PublicUser = Omit<User, "passwordHash">;

export type ReturnRequest = {
  id: string;
  orderId: string;
  userId?: string;
  items: { sku: string; name: string; quantity: number }[];
  reason: string;
  details?: string;
  resolution: "return" | "exchange";
  exchangeSize?: string;
  refundMethod?: string;
  status: "requested" | "approved" | "picked_up" | "refunded" | "exchanged";
  createdAt: string;
};
