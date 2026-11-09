# THREADS WARE — Premium Menswear E-commerce

A complete, multi-page luxury **topwear and designer wear** storefront (T-shirts, shirts, polos, knitwear, outerwear and tailoring) built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4** and **Framer Motion**. It covers the whole customer journey: discovery → product → bag → checkout → confirmation → account → tracking → returns → support.

## Quick start

```bash
npm install
cp .env.example .env.local      # then set AUTH_SECRET (e.g. `openssl rand -base64 48`)
npm run dev                     # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

> `AUTH_SECRET` is **required** in production. Without it, sign-in and checkout fail closed and show a branded error.

### Demo data

| What | Value |
| --- | --- |
| Customer account | `arjun@threadsware.in` / `Threads@2026` (2 orders, addresses, saved cards, wishlist) |
| Track an order (guest) | `TW-517406` + `arjun@threadsware.in` |
| Promo codes | `WELCOME10` (10%), `TW500` (₹500 off ≥ ₹4,999), `SIGNATURE15` (15% off ≥ ₹9,999) |
| Gift card | `TWGC-DEMO-2026` (₹5,000 balance) |
| Simulate a declined payment | Card ending `0002` (e.g. `4000 0000 0000 0002`) or UPI `fail@upi` |
| Any other test card | Must pass a Luhn check, e.g. `4242 4242 4242 4242` |

Local data is stored in `.data/store.json`; it is created and seeded on first run. Delete the file to reset.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |

## Pages

Home · New Arrivals · Shop All · Collections (index + 12 collections) · Best Sellers · Trending · Sale · Category pages (`/men/[category]`: T-Shirts, Shirts, Polos, Sweatshirts & Hoodies, Knitwear, Jackets, Coats, Blazers & Suiting, Occasionwear, plus the Clothing, Topwear and **Designer Wear** groups, with `?type=` sub-types from the mega menu) · Product detail (33 products) · Search · Wishlist · Bag · Checkout · Order Confirmation · Login · Register · Forgot / Reset Password · Account Overview · Orders · Order Detail · Wishlist · Addresses · Profile · Payment Methods · Preferences · Track Order · Returns/Exchange Request · About · Our Story · Journal + 6 articles · Contact · FAQ · Shipping · Returns policy · Size Guide · Privacy · Terms · Cookies · Careers · Stores (coming soon) · Gift Cards · 404.

> **Scope:** the catalogue is deliberately limited to topwear and designer wear. Footwear, accessories, bottomwear, activewear and loungewear were removed; their old `/men/...` URLs redirect permanently to `/men/clothing`.

## Architecture

```
src/
  app/
    (site)/            Storefront routes (header, footer, mobile tab bar)
    (checkout)/        Distraction-free checkout layout
    api/               Route handlers: auth, me, orders, track, returns, reviews,
                       promo, pincode, stock, wishlist, cart, newsletter, contact, notify, gift cards
    sitemap.ts, robots.ts, not-found.tsx, layout.tsx (fonts, providers, JSON-LD)
  proxy.ts             Gate for /account/* (Next 16 replacement for middleware)
  components/
    layout/            Header, MegaMenu, MobileNav, MobileTabBar, SearchOverlay, Footer, AnnouncementBar
    product/           ProductCard, ProductGrid, ProductCarousel, ProductGallery, ProductView,
                       ColorSwatches, SizeSelector, WishlistButton, Reviews, RecentlyViewed
    listing/           ListingView (filters, sort, grid switch, load more), ListingPage
    cart/              CartDrawer, CartItem, OrderSummary, PromoCode, FreeShipping
    checkout/          CheckoutForm (5 steps), AddressForm
    account/ orders/ auth/ home/ editorial/ content/ common/ ui/
  data/                Catalogue: products, categories, collections, reviews, journal, FAQ, navigation, images
  lib/
    pricing.ts         Single source of truth for totals (client display + server verification)
    filters.ts search.ts analytics.ts seo.ts validation.ts site.ts
    server/            store (persistence), auth (scrypt + HMAC sessions), payments, promos, http helpers
supabase/schema.sql    Production PostgreSQL schema with RLS
```

### Experience layer (3D, motion, interaction)

**Homepage:** oxblood hero slider (duotone looks, centred uppercase title, price bubble, round arrows, motion-blur transitions), trust bar, the shelf as a rounded-card carousel with a progress bar, the oxblood story block, look cards, the Build-the-look outfit builder, new arrivals, customer notes, makers strip, delivery map, "in the wild" tiles, and a dark espresso footer with a "Made to be worn" sign.

**3D (`src/components/three/`)**
- `ClothScene` is one R3F scene used in two places: the fabric swatch (The Cloth section and the PDP viewer) and the closing CTA (suede). Folds, a pointer "press" ripple and analytic normals are computed in the **vertex shader** (injected into `MeshPhysicalMaterial` with its cloth `sheen` model), so the CPU does no per-frame geometry work.
- `weave.ts` generates tileable normal maps procedurally (jersey, oxford basket, poplin, linen slub, knit, suede nap, twill, hopsack). There are no model or texture downloads, and maps are cached and shared between scenes.
- `fabrics.ts` holds the physical values and the plain-language copy (what it is / why it matters / what you get) for each fabric. `fabricForMaterial()` maps a product's material to the matching fabric for the PDP "See the cloth in 3D" dialog.
- `Cloth3D` handles performance and safety. three.js lives in its own chunk, loaded only on the homepage or on demand. Scenes mount after `load` plus an idle slot (so they never compete with first paint), only near the viewport, and pause their render loop off-screen or in background tabs. Lower-power devices (coarse pointer, small screen, ≤4 cores or Save-Data) get fewer segments and lower DPR, and adaptive DPR steps down further if frame rate drops. Reduced motion renders a single still frame. Without WebGL, the CSS poster remains. Materials and the PMREM environment are disposed on unmount.

**Motion system:** three tiers in tokens: micro 220ms, component 450ms, cinematic 900ms, with expo-out easing. Primitives live in `src/components/motion/`: `WordReveal` (masked word stagger, headings only), `Magnetic` (primary CTAs, fine pointers only), `CursorLabel` (contextual "View / Explore / Zoom" disc via `data-cursor`; the native cursor is never hidden), `StatCounter`, `SmoothScroll` (Lenis on desktop wheel only; scroll panels opt out with `data-lenis-prevent`; it pauses while modals lock the body), `FloatingField` (animated labels, inline validation, success tick). Under `prefers-reduced-motion`, Lenis, the cursor, parallax, auto-advance and 3D animation are all off and headings render statically.

### Design system

Tokens live in `src/app/globals.css` (`@theme`): colour (butter-cream canvas `#F8EFDF`, oxblood `#7A1C2A`, ochre `#E2A93B`, bottle green `#25412F`, espresso `#3E2117`, ink `#2A1A14`), typography (Montserrat heavy uppercase display, labels and buttons; Manrope body, via `next/font`), spacing (`--spacing-gutter`, `--spacing-section`), container widths, motion (`--ease-lux`, 200–700ms), and component classes (`.btn-*`, `.field`, `.check`, `.prose-tw`). Mixed photography is unified with a single `img-grade` filter. `prefers-reduced-motion` disables all animation, and Framer Motion respects it via `MotionConfig`.

### Security

- Passwords are hashed with **scrypt** (per-user salt) and compared in constant time.
- Sessions use HMAC-signed, `httpOnly`, `SameSite=Lax` cookies, verified server-side in the account layout. `proxy.ts` provides a fast redirect.
- **Prices, stock and promotions are recomputed on the server** for every order; client totals are display-only. Promo codes never ship to the browser.
- All inputs are validated with **Zod**. Errors are branded and never expose internals. Auth, checkout and forms are rate-limited.
- Order confirmations need either the owner's session or a signed access token.
- Card data: only the last four digits reach the server. In production the gateway tokenises cards.
- Security headers (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff). Login responses don't reveal whether an account exists.

### SEO

Every page has a unique title, description, canonical URL, Open Graph and Twitter metadata (`lib/seo.ts`). Structured data covers Organization, WebSite + SearchAction, Product (offers, AggregateRating, reviews, shipping and return policy), BreadcrumbList, CollectionPage/ItemList, FAQPage and Article. URLs are clean (`/men/t-shirts`, `/collections/signature`, `/products/mercer-heavyweight-tee`, `/journal/modern-layering-guide`). Product, category, collection and article pages are statically generated, and unknown slugs return a real 404.

### Analytics-ready

`lib/analytics.ts` emits GA4-shaped e-commerce events (`view_item`, `view_item_list`, `add_to_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`, `search`, `sign_up`, `newsletter_signup`, …) to `dataLayer` and mirrors them to Meta Pixel. GTM, GA4 and Meta Pixel load **only after cookie consent** (`components/common/Analytics.tsx`). Set `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID` and `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to enable them. Signed-in carts are snapshotted server-side (`/api/cart`), ready for abandoned-cart email flows.

## Store admin

`/admin` is the back office. Sign in with an account whose email is in `ADMIN_EMAILS` (comma-separated). In local
development, if `ADMIN_EMAILS` is empty, the demo account `arjun@threadsware.in` is an admin so you can try it.

| Section | What you can do |
|---|---|
| Overview | Sales, orders, customers, sizes running low, what needs attention |
| Orders | Search and filter; move an order through packed → shipped (courier + tracking) → delivered; cancel (stock goes back) |
| Products | Edit name, descriptions, price, sale price, photo label, New / Best seller, hide from shop; set stock per colour and size; add new products; undo edits |
| Offers | Percentage off everything, a category or a collection, with an optional end date |
| Coupons | Create, edit, pause and delete codes: % or ₹ off, minimum order, usage limit, last day |
| Customers, Returns, Inbox | Spend per customer; move returns to approved → picked up → refunded/exchanged; contact messages, newsletter (CSV export), back-in-stock requests |
| Settings | Top message bar and shipping charges |

Edits are stored in the same data store as orders (`catalog` and `coupons`) and applied over the catalogue in
`src/data/products.ts` by `src/lib/catalog.ts`, on the server and in the browser. Every admin page and action checks
admin access on the server.

> Data is stored in Supabase when `SUPABASE_SECRET_KEY` is set (see "Database" below); otherwise in a local JSON file.

## Database (Supabase)

1. In the Supabase dashboard open **SQL Editor → New query**, paste `supabase/schema.sql`, and **Run**. It creates
   the tables (customers, orders, returns, reviews, coupons, gift_cards, newsletter_subscribers, contact_messages,
   stock_alerts, password_resets, inventory, store_settings) and the `tw_apply` save function. Safe to re-run.
2. Copy the **secret** key (Project Settings → API Keys) into `SUPABASE_SECRET_KEY` in `.env.local` and in Vercel.
   Never prefix it with `NEXT_PUBLIC_`.
3. Start the site. On first connection an empty database is filled from your local `.data/store.json`
   (or the demo data on Vercel).

Row Level Security is on for every table with no public policies, so the publishable key in the browser can't
read any customer data; only the server, with the secret key, can.

## Going to production

1. **Database:** run `supabase/schema.sql` in Supabase. Then re-implement `read`/`write` in `src/lib/server/store.ts` against Supabase with the service-role key (server only). Each JSON collection maps to a table. The JSON store is single-instance and is meant for local use and demos only; on Vercel it writes to `/tmp` and does not persist.
2. **Auth:** keep the current scrypt + signed-cookie sessions, or switch `lib/server/auth.ts` to Supabase Auth (the `profiles` table already references `auth.users`). Wire password-reset emails in `api/auth/forgot` (in development the reset link is logged to the console instead).
3. **Payments:** set `PAYMENT_PROVIDER=razorpay` or `stripe` and implement the adapter in `lib/server/payments.ts` (create the order/intent server-side, confirm on the client, fulfil on the webhook).
4. **Email/SMS:** forward newsletter sign-ups, order confirmations, stock alerts and contact messages from their route handlers to your provider.
5. **Photography:** `src/data/images.ts` currently uses Unsplash placeholder photography as stand-ins. Replace every entry with Threads Ware campaign and product photography (and your own CDN loader in `src/lib/image-loader.ts`) **before launch**.
6. **Admin:** the schema already covers products, variants, inventory, collections, orders, returns, coupons, reviews (with moderation status), banners, journal, campaigns and subscribers, so an admin dashboard can be added as an `(admin)` route group behind `role = 'admin'`.
7. **Legal copy:** the company details (GSTIN, address, phone numbers, emails) are realistic placeholders. Replace them in `src/lib/site.ts`, and have the policy pages reviewed by counsel.
