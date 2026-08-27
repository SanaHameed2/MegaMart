-- =========================================================
-- MegaMart Seed Data
-- Run after schema.sql. Uses placeholder image URLs from
-- Unsplash-style paths — replace with your real asset URLs
-- (see /src/assets or your Supabase Storage bucket) before going live.
-- =========================================================

insert into categories (name, slug, sort_order) values
  ('Electronics', 'electronics', 1),
  ('Fashion', 'fashion', 2),
  ('Home & Kitchen', 'home-kitchen', 3),
  ('Groceries', 'groceries', 4)
on conflict (slug) do nothing;

insert into categories (name, slug, parent_id, sort_order)
select 'Smartphones','smartphones', id, 1 from categories where slug='electronics'
union all
select 'Laptops','laptops', id, 2 from categories where slug='electronics'
union all
select 'Accessories','electronics-accessories', id, 3 from categories where slug='electronics'
on conflict (slug) do nothing;

insert into brands (name, slug) values
  ('Apple','apple'), ('Samsung','samsung'), ('Xiaomi','xiaomi'),
  ('Generic','generic'), ('MegaMart Basics','megamart-basics')
on conflict (slug) do nothing;

-- Products (prices in PKR)
insert into products (name, slug, description, price, compare_at_price, sku, category_id, brand_id, stock, rating, review_count, specifications)
select
  'iPhone 14', 'iphone-14',
  'Apple iPhone 14 with A15 Bionic chip, dual camera system, and all-day battery life.',
  289999, 319999, 'SKU-IP14-128',
  (select id from categories where slug='smartphones'),
  (select id from brands where slug='apple'),
  25, 4.6, 128,
  '{"Storage":"128GB","Display":"6.1-inch Super Retina XDR","Color":"Midnight"}'::jsonb
union all
select
  'Samsung Galaxy S22 Ultra', 'samsung-galaxy-s22-ultra',
  'Flagship Samsung phone with S Pen, 108MP camera, and 5000mAh battery.',
  259999, 289999, 'SKU-SGS22U',
  (select id from categories where slug='smartphones'),
  (select id from brands where slug='samsung'),
  15, 4.5, 96,
  '{"Storage":"256GB","Display":"6.8-inch Dynamic AMOLED","Color":"Phantom Black"}'::jsonb
union all
select
  'Xiaomi Redmi Note 12', 'xiaomi-redmi-note-12',
  'Affordable performance phone with AMOLED display and fast charging.',
  49999, 59999, 'SKU-XRN12',
  (select id from categories where slug='smartphones'),
  (select id from brands where slug='xiaomi'),
  40, 4.2, 210,
  '{"Storage":"128GB","Display":"6.67-inch AMOLED","Color":"Onyx Gray"}'::jsonb
union all
select
  'MacBook Air M2', 'macbook-air-m2',
  'Ultra-thin laptop with Apple M2 chip, 18-hour battery, and fanless design.',
  449999, null, 'SKU-MBA-M2',
  (select id from categories where slug='laptops'),
  (select id from brands where slug='apple'),
  10, 4.8, 64,
  '{"RAM":"8GB","Storage":"256GB SSD","Color":"Space Gray"}'::jsonb
union all
select
  'Wireless Earbuds Pro', 'wireless-earbuds-pro',
  'Noise-cancelling wireless earbuds with 24-hour battery case.',
  8999, 12999, 'SKU-WEP-01',
  (select id from categories where slug='electronics-accessories'),
  (select id from brands where slug='generic'),
  100, 4.1, 340,
  '{"Battery":"24 hours with case","Bluetooth":"5.3"}'::jsonb
on conflict (slug) do nothing;

-- One image per product (replace with your real hosted images/Storage URLs)
insert into product_images (product_id, url, sort_order, alt_text)
select id, '/assets/products/' || slug || '.jpg', 0, name from products
on conflict do nothing;

-- Sample coupon
insert into coupons (code, discount_type, discount_value, min_order_amount, max_discount, is_active)
values ('SAVE10', 'percentage', 10, 5000, 2000, true)
on conflict (code) do nothing;
