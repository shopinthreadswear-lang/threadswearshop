-- ═══════════════════════════════════════════════════════════════════════════
-- THREADS WEAR — Supabase database
--
-- Everything the store keeps: customers, orders, returns, reviews, coupons, gift cards,
-- newsletter, contact messages, back-in-stock requests, stock counts and admin settings.
--
-- How it's used: the website's server (src/lib/server/store.ts) talks to these tables with the
-- SECRET key. The publishable key used in browsers can't read or write any of them —
-- Row Level Security is on for every table and there are no public policies.
--
-- Each table keeps the full record in `data` (jsonb) plus real columns for the fields you'll
-- want to see and filter in the Supabase Table Editor (email, status, total, dates…).
-- All writes go through tw_apply(), which applies a batch atomically and bumps a version
-- number, so two servers saving at once can never overwrite each other.
--
-- Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists citext;

-- Version counter: every save increments it; servers re-read when it changes.
create table if not exists tw_meta (
  id         int primary key default 1 check (id = 1),
  version    bigint not null default 0,
  updated_at timestamptz not null default now()
);
insert into tw_meta (id) values (1) on conflict (id) do nothing;

-- ─── Customers ──────────────────────────────────────────────────────────────
create table if not exists customers (
  key        text primary key,                                    -- user id
  data       jsonb not null,
  email      citext generated always as (lower(data->>'email')) stored,
  first_name text generated always as (data->>'firstName') stored,
  last_name  text generated always as (data->>'lastName') stored,
  phone      text generated always as (data->>'phone') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists customers_email_key on customers (email);

-- ─── Orders ─────────────────────────────────────────────────────────────────
create table if not exists orders (
  key          text primary key,                                  -- order number, e.g. TW-482913
  data         jsonb not null,
  customer_id  text generated always as (data->>'userId') stored,
  email        citext generated always as (lower(data->>'email')) stored,
  status       text generated always as (data->>'status') stored,
  total        integer generated always as (((data->'totals'->>'total')::numeric)::integer) stored,
  payment      text generated always as (data->'payment'->>'status') stored,
  promo_code   text generated always as (data->>'promoCode') stored,
  placed_at    text generated always as (data->>'createdAt') stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists orders_customer_idx on orders (customer_id);
create index if not exists orders_email_idx on orders (email);
create index if not exists orders_status_idx on orders (status);

-- ─── Returns & exchanges ────────────────────────────────────────────────────
create table if not exists returns (
  key        text primary key,
  data       jsonb not null,
  order_key  text generated always as (data->>'orderId') stored,
  status     text generated always as (data->>'status') stored,
  resolution text generated always as (data->>'resolution') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Reviews ────────────────────────────────────────────────────────────────
create table if not exists reviews (
  key        text primary key,
  data       jsonb not null,
  product_id text generated always as (data->>'productId') stored,
  rating     integer generated always as (((data->>'rating')::numeric)::integer) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on reviews (product_id);

-- ─── Coupons ────────────────────────────────────────────────────────────────
create table if not exists coupons (
  key        text primary key,
  data       jsonb not null,
  code       text generated always as (data->>'code') stored,
  active     boolean generated always as ((data->>'active')::boolean) stored,
  used       integer generated always as (coalesce(((data->>'used')::numeric)::integer, 0)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists coupons_code_key on coupons (code);

-- ─── Gift cards ─────────────────────────────────────────────────────────────
create table if not exists gift_cards (
  key        text primary key,                                    -- the code
  data       jsonb not null,
  balance    integer generated always as (((data->>'balance')::numeric)::integer) stored,
  recipient  citext generated always as (lower(data->>'recipientEmail')) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Newsletter, messages, back-in-stock, password resets ───────────────────
create table if not exists newsletter_subscribers (
  key        text primary key,                                    -- email
  data       jsonb not null,
  source     text generated always as (data->>'source') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contact_messages (
  key        text primary key,
  data       jsonb not null,
  email      citext generated always as (lower(data->>'email')) stored,
  topic      text generated always as (data->>'topic') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stock_alerts (
  key        text primary key,                                    -- product|colour|size|contact
  data       jsonb not null,
  product_id text generated always as (data->>'productId') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists password_resets (
  key        text primary key,                                    -- sha-256 of the token, never the token
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Stock: units sold per SKU since the admin last set the count ───────────
create table if not exists inventory (
  key        text primary key,                                    -- SKU
  data       jsonb not null,                                      -- { "sold": n }
  sold       integer generated always as (((data->>'sold')::numeric)::integer) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Admin: catalogue edits, offers, new products, store settings ───────────
create table if not exists store_settings (
  key        text primary key,                                    -- 'catalog'
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Security: nothing is readable with the public (publishable/anon) key ───
do $$
declare t text;
begin
  foreach t in array array['tw_meta','customers','orders','returns','reviews','coupons','gift_cards',
    'newsletter_subscribers','contact_messages','stock_alerts','password_resets','inventory','store_settings']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('revoke all on table %I from anon, authenticated', t);
  end loop;
end $$;

-- ─── tw_apply: one atomic batch of upserts and deletes ──────────────────────
-- changes = { "orders": { "upsert": [{ "key": "...", "data": {...} }], "delete": ["key", ...] }, ... }
-- Fails with 'version_conflict' if someone else saved since `expected`; the server then reloads and retries.
create or replace function tw_apply(expected bigint, changes jsonb)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed constant text[] := array['customers','orders','returns','reviews','coupons','gift_cards',
    'newsletter_subscribers','contact_messages','stock_alerts','password_resets','inventory','store_settings'];
  current_version bigint;
  t text;
  item jsonb;
begin
  select version into current_version from tw_meta where id = 1 for update;
  if current_version <> expected then
    raise exception 'version_conflict' using errcode = 'P0001';
  end if;

  for t in select jsonb_object_keys(changes) loop
    if not (t = any(allowed)) then
      raise exception 'unknown table %', t;
    end if;
    for item in select * from jsonb_array_elements(coalesce(changes->t->'delete', '[]'::jsonb)) loop
      execute format('delete from %I where key = $1', t) using item #>> '{}';
    end loop;
    for item in select * from jsonb_array_elements(coalesce(changes->t->'upsert', '[]'::jsonb)) loop
      execute format(
        'insert into %I (key, data) values ($1, $2)
         on conflict (key) do update set data = excluded.data, updated_at = now()', t)
      using item->>'key', item->'data';
    end loop;
  end loop;

  update tw_meta set version = version + 1, updated_at = now() where id = 1
  returning version into current_version;
  return current_version;
end $$;

revoke all on function tw_apply(bigint, jsonb) from public, anon, authenticated;
grant execute on function tw_apply(bigint, jsonb) to service_role;

-- ─── Photo storage: admin uploads (products, homepage) ──────────────────────
-- Public to read (photos are shown in the shop). Only the server's secret key can create upload links,
-- so customers can't upload anything.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
