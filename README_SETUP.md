# Roots & Earth — Fresh Food E-commerce (MVP)

## 🚀 1-time Supabase setup (5 minutes)

### A. Create the database schema + seed data
1. Open your Supabase dashboard → **SQL Editor** → **New query**
2. Open `/app/SUPABASE_SETUP.sql` (in this workspace), copy the entire contents, paste, and **Run**.
3. You should see "Success. No rows returned" at the bottom.

This creates:
- Tables: `profiles`, `categories`, `products`, `orders`, `order_items`, `favorites`
- Row-Level Security policies (users see their own orders, admins see all, public read for products/categories)
- A trigger that auto-creates a `profiles` row whenever anyone signs up
- 6 categories + 16 seeded products (heirloom tomatoes, avocados, free-range eggs, etc.)

### B. Enable Google OAuth (optional, for "Continue with Google")
1. Supabase dashboard → **Authentication → Providers → Google**
2. Toggle **Enable sign-in with Google**
3. Follow Supabase's on-screen steps to paste a Google OAuth Client ID + Secret (from Google Cloud Console)
4. Set the **Authorized redirect URL** from Supabase into Google Cloud Console.
5. Save.

If you skip this, email/password signup still works perfectly.

### C. Give yourself admin access (to see the Admin dashboard)
1. Sign up in the app with any email
2. Supabase dashboard → **Table Editor → profiles**
3. Find your row → set `is_admin = true` → save
4. Refresh the app — the admin icon will appear in the navbar.

## 🧪 What's built

| Feature | Location |
| --- | --- |
| Hero carousel (3 auto-rotating banners + CTAs) | `/` |
| Sidebar categories with icons + filters | `/` |
| Product grid + premium product cards | `/` |
| Best sellers / Organic picks / New arrivals / Limited deals | `/` |
| Countdown timer for limited deals | `/` |
| Search + price / organic / in-stock filters | Navbar + sidebar |
| Slide-in cart with qty controls | Cart icon |
| Checkout (delivery/pickup, address, fee calc, ETA) | `/checkout` |
| Auth (email/password + Google) | Sign in button |
| Order history | `/orders` |
| Favourites | `/favorites` |
| Admin dashboard (revenue, top products, CRUD) | `/admin` |

## 💰 Payment

MVP uses **Cash on Delivery / Pickup**. No card integration yet.
