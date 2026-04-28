-- ============================================
-- Roots & Earth — Supabase schema & seed
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  icon text,
  image_url text,
  sort_order int default 0
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  stock int default 100,
  is_organic boolean default false,
  is_best_seller boolean default false,
  is_new_arrival boolean default false,
  is_limited_deal boolean default false,
  rating numeric(2,1) default 4.5,
  rating_count int default 0,
  unit text default 'each',
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  status text default 'pending',
  delivery_type text not null,
  address text,
  city text,
  postal_code text,
  phone text,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) default 0,
  total numeric(10,2) not null,
  payment_method text default 'cod',
  estimated_minutes int default 45,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price numeric(10,2) not null,
  quantity int not null,
  image_url text
);

create table if not exists public.favorites (
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);

-- ============================================
-- RLS
-- ============================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.favorites enable row level security;

-- Profiles
drop policy if exists "profiles select self" on public.profiles;
create policy "profiles select self" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles upsert self" on public.profiles;
create policy "profiles upsert self" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles for update using (auth.uid() = id);

-- Public read: categories, products
drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories for select using (true);
drop policy if exists "products read" on public.products;
create policy "products read" on public.products for select using (true);

-- Admin write products + categories
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Orders (user own + admin read all)
drop policy if exists "orders insert own" on public.orders;
create policy "orders insert own" on public.orders for insert with check (auth.uid() = user_id);
drop policy if exists "orders select own or admin" on public.orders;
create policy "orders select own or admin" on public.orders for select
  using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
drop policy if exists "orders update admin" on public.orders;
create policy "orders update admin" on public.orders for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Order items
drop policy if exists "order_items insert via order" on public.order_items;
create policy "order_items insert via order" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "order_items select own or admin" on public.order_items;
create policy "order_items select own or admin" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))));

-- Favorites
drop policy if exists "fav select own" on public.favorites;
create policy "fav select own" on public.favorites for select using (auth.uid() = user_id);
drop policy if exists "fav insert own" on public.favorites;
create policy "fav insert own" on public.favorites for insert with check (auth.uid() = user_id);
drop policy if exists "fav delete own" on public.favorites;
create policy "fav delete own" on public.favorites for delete using (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- SEED
-- ============================================
insert into public.categories (slug, name, icon, image_url, sort_order) values
  ('fruits', 'Fruits', 'apple', 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400', 1),
  ('vegetables', 'Vegetables', 'leafy-green', 'https://images.pexels.com/photos/5502852/pexels-photo-5502852.jpeg?auto=compress&cs=tinysrgb&w=400', 2),
  ('organic-eggs', 'Organic Eggs', 'egg', 'https://images.pexels.com/photos/35377948/pexels-photo-35377948.jpeg?auto=compress&cs=tinysrgb&w=400', 3),
  ('dairy', 'Dairy', 'milk', 'https://images.pexels.com/photos/9424540/pexels-photo-9424540.jpeg?auto=compress&cs=tinysrgb&w=400', 4),
  ('healthy-snacks', 'Healthy Snacks', 'cookie', 'https://images.pexels.com/photos/4499243/pexels-photo-4499243.jpeg?auto=compress&cs=tinysrgb&w=400', 5),
  ('juices', 'Juices & Smoothies', 'cup-soda', 'https://images.pexels.com/photos/32695688/pexels-photo-32695688.jpeg?auto=compress&cs=tinysrgb&w=400', 6)
on conflict (slug) do nothing;

-- Products (uses subselect to get category_id by slug)
insert into public.products (name, description, price, compare_at_price, category_id, image_url, stock, is_organic, is_best_seller, is_new_arrival, is_limited_deal, rating, rating_count, unit) values
  ('Heirloom Tomatoes', 'Heirloom tomatoes sun-ripened on organic vines. Deep flavor, minimal food-miles.', 49.90, 64.90, (select id from public.categories where slug='vegetables'), 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', 42, true, true, false, true, 4.8, 231, '500g'),
  ('Avocado — Hass', 'Creamy Hass avocados from Limpopo. Ripens at room temperature in 2–3 days.', 12.50, null, (select id from public.categories where slug='fruits'), 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=600&q=80', 120, true, true, false, false, 4.7, 418, 'each'),
  ('Baby Spinach', 'Tender baby spinach leaves, triple-washed and ready to eat.', 34.90, 39.90, (select id from public.categories where slug='vegetables'), 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80', 60, true, false, true, false, 4.6, 98, '200g'),
  ('Free-range Eggs', 'Large free-range eggs from pasture-raised hens. Dozen.', 62.00, null, (select id from public.categories where slug='organic-eggs'), 'https://images.pexels.com/photos/35377948/pexels-photo-35377948.jpeg?auto=compress&cs=tinysrgb&w=600', 80, true, true, false, false, 4.9, 512, 'dozen'),
  ('Raw Jersey Milk', 'Unhomogenised jersey cow milk. Cream line settles on top.', 28.90, 34.90, (select id from public.categories where slug='dairy'), 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', 35, true, false, true, true, 4.7, 86, '1L'),
  ('Grass-fed Butter', 'Cultured butter from grass-fed cows. Deep yellow, rich flavor.', 79.00, null, (select id from public.categories where slug='dairy'), 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80', 18, true, false, false, false, 4.8, 74, '250g'),
  ('Raw Cashews', 'Hand-picked raw cashews. No roasting, no salt.', 119.00, 149.00, (select id from public.categories where slug='healthy-snacks'), 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=600&q=80', 50, true, true, false, true, 4.5, 142, '500g'),
  ('Sea-salt Almonds', 'Slow-roasted almonds with flaked Atlantic sea salt.', 89.50, null, (select id from public.categories where slug='healthy-snacks'), 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80', 70, false, false, true, false, 4.4, 63, '300g'),
  ('Cold-pressed Green Juice', 'Spinach, cucumber, apple, ginger, lemon. Made today.', 42.00, null, (select id from public.categories where slug='juices'), 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80', 28, true, false, true, false, 4.6, 51, '500ml'),
  ('Beetroot Smoothie', 'Beetroot, ginger, berry, date. Earthy & deeply nourishing.', 46.00, 52.00, (select id from public.categories where slug='juices'), 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=600&q=80', 24, true, false, false, true, 4.3, 34, '500ml'),
  ('Organic Blueberries', 'Hand-picked berries, flash frozen for freshness.', 89.90, 109.90, (select id from public.categories where slug='fruits'), 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&q=80', 40, true, true, false, true, 4.9, 217, '250g'),
  ('Bananas — Organic', 'Fair-trade organic bananas. Perfect ripeness.', 22.90, null, (select id from public.categories where slug='fruits'), 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&q=80', 200, true, false, false, false, 4.5, 320, 'bunch'),
  ('Rainbow Carrots', 'Purple, yellow, and classic orange carrots. Farmstand-fresh.', 38.50, null, (select id from public.categories where slug='vegetables'), 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80', 55, true, false, true, false, 4.4, 47, '500g'),
  ('Artisan Sourdough Loaf', 'Long-fermented sourdough, crackling crust, open crumb.', 65.00, null, (select id from public.categories where slug='healthy-snacks'), 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80', 15, false, true, false, false, 4.9, 189, 'loaf'),
  ('Kalahari Sea Salt', 'Single-source Kalahari sea salt, large flake.', 54.00, 68.00, (select id from public.categories where slug='healthy-snacks'), 'https://images.unsplash.com/photo-1518110925495-b37653cd099f?w=600&q=80', 65, true, false, false, true, 4.7, 28, '250g'),
  ('Hand-churned Yoghurt', 'Double-cream plain yoghurt. No sugar, just cultures.', 48.00, null, (select id from public.categories where slug='dairy'), 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&q=80', 32, true, false, true, false, 4.6, 41, '500g')
on conflict do nothing;
