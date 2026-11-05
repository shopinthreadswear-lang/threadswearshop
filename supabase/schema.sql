-- ═══════════════════════════════════════════════════════════════════════════
-- THREADS WEAR — production schema (Supabase / PostgreSQL 15+)
-- Mirrors the JSON store in src/lib/server/store.ts. Run in the Supabase SQL editor
-- or via `supabase db push`. Row Level Security is enabled on every customer table;
-- the storefront server uses the service role for order creation & price verification.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";

-- ─── Enums ──────────────────────────────────────────────────────────────────
create type order_status   as enum ('placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled','returned');
create type payment_status as enum ('pending','paid','cod','failed','refunded','partially_refunded');
create type return_status  as enum ('requested','approved','picked_up','refunded','exchanged','rejected');
create type product_fit    as enum ('Slim','Regular','Relaxed','Oversized','Tailored','One Size');
create type coupon_type    as enum ('percent','fixed');
create type user_role      as enum ('customer','staff','admin');

-- ─── Customers ──────────────────────────────────────────────────────────────
-- Authentication is handled by Supabase Auth (auth.users); profiles extend it.
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  email         citext unique not null,
  phone         text,
  dob           date,
  role          user_role not null default 'customer',
  preferences   jsonb not null default '{"newsletter":false,"sms":true,"whatsapp":false}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  label       text not null default 'Home',
  full_name   text not null,
  phone       text not null,
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  pincode     char(6) not null check (pincode ~ '^[1-9][0-9]{5}$'),
  country     text not null default 'India',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index one_default_address on addresses(user_id) where is_default;

-- Tokenised references only — never PAN/CVV (RBI card-on-file tokenisation).
create table saved_payment_methods (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  type           text not null check (type in ('card','upi')),
  gateway_token  text,                 -- token from Razorpay / Stripe
  brand          text,
  last4          char(4),
  expiry         text,
  holder         text,
  vpa            text,
  is_default     boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ─── Catalogue ──────────────────────────────────────────────────────────────
create table categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  title        text not null,
  group_name   text not null,
  description  text,
  image_url    text,
  parent_id    uuid references categories(id),
  sort_order   int not null default 0
);

create table product_types (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references categories(id) on delete cascade,
  name         text not null,
  slug         text not null,
  unique (category_id, slug)
);

create table collections (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  tagline          text,
  description      text,
  image_url        text,
  secondary_image  text,
  is_published     boolean not null default true,
  sort_order       int not null default 0
);

create table products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  short_description   text not null,
  description         text not null,
  category_id         uuid not null references categories(id),
  product_type_id     uuid references product_types(id),
  price               int not null check (price > 0),           -- INR, GST inclusive
  compare_at_price    int check (compare_at_price is null or compare_at_price > price),
  currency            char(3) not null default 'INR',
  materials           text,
  composition         text[] not null default '{}',
  fit                 product_fit not null,
  model_info          text,
  care_instructions   text[] not null default '{}',
  features            text[] not null default '{}',
  sku                 text unique not null,
  tags                text[] not null default '{}',
  pattern             text,
  sleeve              text,
  occasion            text[] not null default '{}',
  video_url           text,
  is_new              boolean not null default false,
  is_best_seller      boolean not null default false,
  is_limited_edition  boolean not null default false,
  is_trending         boolean not null default false,
  is_published        boolean not null default true,
  rating              numeric(2,1) not null default 0,
  review_count        int not null default 0,
  seo_title           text,
  seo_description     text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index products_search on products using gin ((name || ' ' || coalesce(short_description,'')) gin_trgm_ops);
create index products_category on products(category_id) where is_published;

create table product_collections (
  product_id     uuid references products(id) on delete cascade,
  collection_id  uuid references collections(id) on delete cascade,
  sort_order     int not null default 0,
  primary key (product_id, collection_id)
);

create table product_colors (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  name        text not null,
  hex         char(7) not null,
  sort_order  int not null default 0,
  unique (product_id, name)
);

create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  color_id    uuid references product_colors(id) on delete cascade,
  url         text not null,
  alt         text not null,
  view        text,                    -- front, back, side, detail, model, styling
  sort_order  int not null default 0
);

create table product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  color_id    uuid not null references product_colors(id) on delete cascade,
  size        text not null,
  sku         text unique not null,
  barcode     text,
  price_override int,
  unique (product_id, color_id, size)
);

create table inventory (
  variant_id   uuid primary key references product_variants(id) on delete cascade,
  on_hand      int not null default 0 check (on_hand >= 0),
  reserved     int not null default 0 check (reserved >= 0),
  low_stock_threshold int not null default 5,
  updated_at   timestamptz not null default now()
);

create table related_products (            -- "Complete the Look"
  product_id   uuid references products(id) on delete cascade,
  related_id   uuid references products(id) on delete cascade,
  kind         text not null default 'complete_the_look',
  sort_order   int not null default 0,
  primary key (product_id, related_id, kind)
);

create table stock_alerts (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references product_variants(id) on delete cascade,
  contact     text not null,
  notified_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ─── Engagement ─────────────────────────────────────────────────────────────
create table wishlist_items (
  user_id     uuid references profiles(id) on delete cascade,
  product_id  uuid references products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table carts (                        -- powers cross-device restore & abandoned-cart flows
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references profiles(id) on delete cascade,
  anonymous_id text unique,
  updated_at  timestamptz not null default now(),
  recovered_at timestamptz
);
create table cart_items (
  cart_id     uuid references carts(id) on delete cascade,
  variant_id  uuid references product_variants(id) on delete cascade,
  quantity    int not null check (quantity between 1 and 10),
  primary key (cart_id, variant_id)
);

create table reviews (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  user_id         uuid references profiles(id) on delete set null,
  order_id        uuid,
  author_name     text not null,
  rating          smallint not null check (rating between 1 and 5),
  title           text not null,
  body            text not null,
  fit             text check (fit in ('Runs small','True to size','Runs large')),
  quality         smallint check (quality between 1 and 5),
  size_purchased  text,
  image_urls      text[] not null default '{}',
  is_verified     boolean not null default false,
  status          text not null default 'pending' check (status in ('pending','published','rejected')),
  helpful_count   int not null default 0,
  created_at      timestamptz not null default now()
);

create table newsletter_subscribers (
  email        citext primary key,
  source       text,
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- ─── Commerce ───────────────────────────────────────────────────────────────
create table coupons (
  code          citext primary key,
  type          coupon_type not null,
  value         int not null check (value > 0),
  min_subtotal  int,
  description   text,
  starts_at     timestamptz,
  expires_at    timestamptz,
  usage_limit   int,
  per_customer_limit int default 1,
  times_used    int not null default 0,
  is_active     boolean not null default true
);

create table orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text unique not null,        -- e.g. TW-482913
  user_id            uuid references profiles(id) on delete set null,
  email              citext not null,
  phone              text not null,
  shipping_address   jsonb not null,
  delivery_method    text not null check (delivery_method in ('standard','express')),
  status             order_status not null default 'placed',
  payment_method     text not null,
  payment_status     payment_status not null default 'pending',
  payment_reference  text,
  gateway            text,                        -- razorpay | stripe
  subtotal           int not null,
  discount           int not null default 0,
  shipping           int not null default 0,
  cod_fee            int not null default 0,
  tax                int not null default 0,
  total              int not null,
  coupon_code        citext references coupons(code),
  courier_name       text,
  tracking_id        text,
  expected_delivery  date,
  created_at         timestamptz not null default now()
);
create index orders_user on orders(user_id, created_at desc);

create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  variant_id   uuid references product_variants(id),
  product_name text not null,          -- snapshot at purchase time
  color        text not null,
  size         text not null,
  sku          text not null,
  image_url    text,
  unit_price   int not null,
  quantity     int not null check (quantity > 0),
  line_total   int not null
);

create table order_events (            -- tracking timeline
  id         bigserial primary key,
  order_id   uuid not null references orders(id) on delete cascade,
  status     order_status not null,
  note       text,
  created_at timestamptz not null default now()
);

create table returns (
  id               uuid primary key default gen_random_uuid(),
  return_number    text unique not null,
  order_id         uuid not null references orders(id),
  user_id          uuid references profiles(id),
  reason           text not null,
  details          text,
  resolution       text not null check (resolution in ('return','exchange')),
  exchange_size    text,
  refund_method    text,
  status           return_status not null default 'requested',
  created_at       timestamptz not null default now()
);
create table return_items (
  return_id      uuid references returns(id) on delete cascade,
  order_item_id  uuid references order_items(id),
  quantity       int not null default 1,
  primary key (return_id, order_item_id)
);

create table gift_cards (
  code             text primary key,
  initial_balance  int not null,
  balance          int not null check (balance >= 0),
  recipient_email  citext not null,
  message          text,
  purchased_order  uuid references orders(id),
  expires_at       timestamptz not null default now() + interval '12 months',
  created_at       timestamptz not null default now()
);

-- ─── Content (admin-managed) ────────────────────────────────────────────────
create table homepage_banners (
  id          uuid primary key default gen_random_uuid(),
  placement   text not null,            -- hero, signature, packaging…
  eyebrow     text,
  headline    text not null,
  body        text,
  cta_label   text,
  cta_href    text,
  image_url   text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  sort_order  int not null default 0
);

create table journal_articles (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text not null,
  category     text,
  author       text,
  hero_image   text,
  body         jsonb not null,           -- block content
  product_ids  uuid[] not null default '{}',
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

create table campaigns (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  collection_id uuid references collections(id),
  starts_at   timestamptz,
  ends_at     timestamptz,
  content     jsonb
);

create table contact_messages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         citext not null,
  phone         text,
  order_number  text,
  topic         text not null,
  message       text not null,
  status        text not null default 'open',
  created_at    timestamptz not null default now()
);

-- ─── Inventory reservation: atomic, prevents overselling ────────────────────
create or replace function reserve_stock(p_variant uuid, p_qty int)
returns boolean language plpgsql security definer as $$
begin
  update inventory set on_hand = on_hand - p_qty, updated_at = now()
   where variant_id = p_variant and on_hand >= p_qty;
  return found;
end $$;

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table profiles               enable row level security;
alter table addresses              enable row level security;
alter table saved_payment_methods  enable row level security;
alter table wishlist_items         enable row level security;
alter table carts                  enable row level security;
alter table cart_items             enable row level security;
alter table orders                 enable row level security;
alter table order_items            enable row level security;
alter table order_events           enable row level security;
alter table returns                enable row level security;
alter table reviews                enable row level security;

create policy "own profile"   on profiles              for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own addresses" on addresses             for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own payments"  on saved_payment_methods for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own wishlist"  on wishlist_items        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cart"      on carts                 for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cart items" on cart_items           for all using (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()));
-- Orders are created only by the server (service role) after price verification; customers may read their own.
create policy "read own orders" on orders              for select using (auth.uid() = user_id);
create policy "read own order items" on order_items    for select using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "read own order events" on order_events  for select using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "read own returns" on returns            for select using (auth.uid() = user_id);
create policy "published reviews are public" on reviews for select using (status = 'published');
create policy "write own review" on reviews            for insert with check (auth.uid() = user_id);

-- Catalogue is public read-only; writes via service role / admin dashboard.
alter table products enable row level security;
create policy "public catalogue" on products for select using (is_published);
