# Roots & Earth — PRD

## Original problem statement
> "promo is it possible if i provide you my github account and my repo name to look into it and fix everything on that repo and update it, on it is code for website i want to deploy it in vercel and use supabase for auth, storing product(table) and easy to fix on supabase table if is possible — repo: https://github.com/Njabulo-Nkosi-Analyst/online-fresh-market-app"
>
> Follow-up: "lets start by fixing my current code making sure it will run smooth even when i upload or deploy on vercel it wont give me error"

## Architecture
- **Frontend**: React 19 (CRA + craco), Tailwind, Radix UI, Recharts, react-router 7
- **Auth + DB**: Supabase (Postgres + Auth, talked to directly from the browser)
- **Hosting**: Vercel (frontend only); FastAPI backend kept in `backend/` but not required for production
- **Frontend ↔ Supabase**: `@supabase/supabase-js` v2, RLS protects writes
- **Vercel deploy**: root-level `vercel.json` builds `frontend/` with `CI=false yarn build`, outputs `frontend/build`

## Personas
- **Shopper** — browses produce, adds to cart, checks out (guest or signed-in), tracks orders, saves favourites
- **Admin** — manages products and views revenue/top-products dashboard via `/admin`

## Core requirements (static)
- Browse + filter + search products (categories sidebar, price slider, organic toggle)
- Hero carousel, best sellers, organic picks, new arrivals, limited deals + countdown
- Cart with quantity controls + delivery/pickup toggle
- Checkout with delivery details, COD payment, order confirmation
- Auth: email/password + Google OAuth (Supabase)
- Order history + Favourites
- Admin: revenue trend, top products, product CRUD
- Frictionless Vercel deploy

## What's been implemented (April 28, 2026)
### Bug fixes for clean Vercel deploys
- **Fixed `CheckoutPage.jsx` runtime crash**: imported missing `supabase` client; removed unused `axios` and `API` imports that broke `CI=true` builds on Vercel
- **Fixed `frontend/vercel.json`**: dropped `--frozen-lockfile` (no lockfile in repo) and added `CI=false` to `yarn build` so React warnings don't fail the deploy
- **Added root `vercel.json`** for monorepo deploys: Vercel can now use `./` as root and the build command handles `cd frontend && yarn install && CI=false yarn build`
- **Created `frontend/.env.example`, `backend/.env.example`** for users
- **Created working `frontend/.env`** for local preview
- **Rewrote `DEPLOY.md`** with corrected Vercel root-directory instructions and a troubleshooting table
- Verified production build succeeds locally and dev server renders the homepage at `http://localhost:3000`

## Backlog / next phase
| Priority | Item |
| --- | --- |
| P1 | Clean up the 3 remaining `react-hooks/exhaustive-deps` ESLint warnings in `AdminPage.jsx`, `OrdersPage.jsx`, `FavoritesPage.jsx` (currently silenced by `CI=false`) |
| P1 | Add a customer profile page (edit name, default delivery address) |
| P2 | Wire up online card payments (Stripe / Yoco for ZAR) — currently COD only |
| P2 | Email order confirmation (Resend / SendGrid) once an order is placed |
| P2 | Image upload from admin instead of paste-URL (Supabase Storage) |
| P3 | Product reviews & ratings (currently a static `rating` field) |
| P3 | Server-side rendering / SEO improvements (move to Next.js or add prerender service) |

## Smart enhancement idea
Add a **"first-order discount" pop-up** triggered after the first product is added to the cart — converts curious browsers into buyers and gives Roots & Earth a measurable conversion lift on Vercel analytics.
