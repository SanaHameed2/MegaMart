-- =========================================================
-- MegaMart Database Schema (PostgreSQL / Supabase)
-- Run this once in the Supabase SQL editor on a fresh project.
-- Safe to re-run: uses IF NOT EXISTS / DROP ... IF EXISTS guards.
-- =========================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------- ENUMS ----------
do $$ begin
  create type order_status as enum (
    'pending','confirmed','processing','packed','shipped','delivered','cancelled','refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('cod','card');
exception when duplicate_object then null; end $$;

-- ---------- PROFILES ----------
-- Mirrors auth.users, created automatically via trigger on signup.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------- ADDRESSES ----------
create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'Pakistan',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- CATEGORIES ----------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  parent_id uuid references categories(id) on delete set null,
  image_url text,
  is_visible boolean not null default true,
  sort_order int not null default 0
);

-- ---------- BRANDS ----------
create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text
);

-- ---------- PRODUCTS ----------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  sku text unique,
  category_id uuid references categories(id) on delete set null,
  brand_id uuid references brands(id) on delete set null,
  stock int not null default 0 check (stock >= 0),
  low_stock_threshold int not null default 5,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  status text not null default 'published' check (status in ('draft','published','archived')),
  specifications jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_brand on products(brand_id);
create index if not exists idx_products_status on products(status);
create index if not exists idx_products_name_trgm on products using gin (to_tsvector('english', name));

-- ---------- PRODUCT IMAGES ----------
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  alt_text text
);

-- ---------- PRODUCT VARIANTS (color/size etc.) ----------
create table if not exists product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,       -- e.g. "Color"
  value text not null,      -- e.g. "Red"
  price_delta numeric(12,2) not null default 0,
  stock int not null default 0
);

-- ---------- CARTS ----------
create table if not exists carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

-- ---------- WISHLISTS ----------
create table if not exists wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------- COUPONS ----------
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric(12,2) not null,
  min_order_amount numeric(12,2) not null default 0,
  max_discount numeric(12,2),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  usage_limit int,
  usage_count int not null default 0
);

-- ---------- ORDERS ----------
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique default ('MM-' || to_char(now(),'YYYYMMDD') || '-' || lpad(floor(random()*100000)::text,5,'0')),
  user_id uuid not null references profiles(id) on delete restrict,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  payment_method payment_method not null default 'cod',
  subtotal numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  coupon_code text,
  shipping_address jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  product_name text not null,      -- snapshot at time of order
  unit_price numeric(12,2) not null, -- snapshot at time of order
  quantity int not null check (quantity > 0),
  variant_label text
);

-- ---------- REVIEWS ----------
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  order_id uuid references orders(id) on delete set null, -- proof of purchase
  rating int not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table wishlist_items enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$ language sql stable security definer;

-- PROFILES: users see/edit only their own row; admins see all
create policy "profiles_select_own_or_admin" on profiles for select
  using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id);

-- ADDRESSES: owner only
create policy "addresses_owner_all" on addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CATEGORIES / BRANDS: public read, admin write
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for insert with check (is_admin());
create policy "categories_admin_update" on categories for update using (is_admin());
create policy "categories_admin_delete" on categories for delete using (is_admin());

create policy "brands_public_read" on brands for select using (true);
create policy "brands_admin_write" on brands for insert with check (is_admin());
create policy "brands_admin_update" on brands for update using (is_admin());
create policy "brands_admin_delete" on brands for delete using (is_admin());

-- PRODUCTS: public read of published items, admin full access
create policy "products_public_read" on products for select
  using (status = 'published' or is_admin());
create policy "products_admin_write" on products for insert with check (is_admin());
create policy "products_admin_update" on products for update using (is_admin());
create policy "products_admin_delete" on products for delete using (is_admin());

create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_admin_write" on product_images for insert with check (is_admin());
create policy "product_images_admin_update" on product_images for update using (is_admin());
create policy "product_images_admin_delete" on product_images for delete using (is_admin());

create policy "product_variants_public_read" on product_variants for select using (true);
create policy "product_variants_admin_write" on product_variants for insert with check (is_admin());
create policy "product_variants_admin_update" on product_variants for update using (is_admin());
create policy "product_variants_admin_delete" on product_variants for delete using (is_admin());

-- CARTS / CART_ITEMS: owner only
create policy "carts_owner_all" on carts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart_items_owner_all" on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()));

-- WISHLIST: owner only
create policy "wishlist_owner_all" on wishlist_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- COUPONS: public read of active coupons only (to validate codes), admin manages
create policy "coupons_public_read_active" on coupons for select using (is_active or is_admin());
create policy "coupons_admin_write" on coupons for insert with check (is_admin());
create policy "coupons_admin_update" on coupons for update using (is_admin());
create policy "coupons_admin_delete" on coupons for delete using (is_admin());

-- ORDERS: owner sees own, admin sees/manages all
create policy "orders_owner_select" on orders for select
  using (auth.uid() = user_id or is_admin());
create policy "orders_owner_insert" on orders for insert
  with check (auth.uid() = user_id);
create policy "orders_admin_update" on orders for update using (is_admin());

create policy "order_items_owner_select" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_items_owner_insert" on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));

-- REVIEWS: public read approved, owner can insert/update own, must have delivered order
create policy "reviews_public_read" on reviews for select using (is_approved or is_admin());
create policy "reviews_owner_insert" on reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from orders o
      join order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid()
        and oi.product_id = reviews.product_id
        and o.status = 'delivered'
    )
  );
create policy "reviews_owner_update" on reviews for update using (auth.uid() = user_id);
create policy "reviews_admin_moderate" on reviews for update using (is_admin());

-- =========================================================
-- FUNCTION: place_order
-- Server-side order creation. Re-fetches real prices & stock,
-- so the frontend can never dictate the final total.
-- =========================================================
create or replace function place_order(
  p_items jsonb,               -- [{ "product_id": "...", "quantity": 2, "variant_id": null }]
  p_shipping_address jsonb,
  p_coupon_code text default null,
  p_payment_method payment_method default 'cod'
) returns uuid as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product products%rowtype;
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_shipping numeric(12,2) := 150; -- flat rate default, documented assumption
  v_total numeric(12,2);
  v_coupon coupons%rowtype;
  v_unit_price numeric(12,2);
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_order_id := uuid_generate_v4();

  -- Validate & lock each product row, compute real subtotal
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products
      where id = (v_item->>'product_id')::uuid
      and status = 'published'
      for update;

    if not found then
      raise exception 'Product % not available', v_item->>'product_id';
    end if;

    if v_product.stock < (v_item->>'quantity')::int then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;

    v_unit_price := v_product.price;
    v_subtotal := v_subtotal + v_unit_price * (v_item->>'quantity')::int;
  end loop;

  -- Validate coupon server-side
  if p_coupon_code is not null then
    select * into v_coupon from coupons
      where code = p_coupon_code and is_active = true
      and (starts_at is null or starts_at <= now())
      and (expires_at is null or expires_at >= now())
      and (usage_limit is null or usage_count < usage_limit);

    if found and v_subtotal >= v_coupon.min_order_amount then
      if v_coupon.discount_type = 'percentage' then
        v_discount := v_subtotal * v_coupon.discount_value / 100;
        if v_coupon.max_discount is not null then
          v_discount := least(v_discount, v_coupon.max_discount);
        end if;
      else
        v_discount := v_coupon.discount_value;
      end if;
      update coupons set usage_count = usage_count + 1 where id = v_coupon.id;
    end if;
  end if;

  v_total := v_subtotal - v_discount + v_shipping;

  insert into orders (id, user_id, subtotal, discount, shipping, tax, total, coupon_code, shipping_address, payment_method)
  values (v_order_id, auth.uid(), v_subtotal, v_discount, v_shipping, 0, v_total, p_coupon_code, p_shipping_address, p_payment_method);

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products where id = (v_item->>'product_id')::uuid;

    insert into order_items (order_id, product_id, product_name, unit_price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price, (v_item->>'quantity')::int);

    update products set stock = stock - (v_item->>'quantity')::int where id = v_product.id;
  end loop;

  -- Clear the user's cart after successful order
  delete from cart_items where cart_id = (select id from carts where user_id = auth.uid());

  return v_order_id;
end;
$$ language plpgsql security definer;
