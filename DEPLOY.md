# Roots & Earth — Deployment Guide

A South African fresh-food e-commerce app. **100% serverless, all-free stack.**

## Tech stack
- **Frontend**: React (Create React App + craco)
- **Database + Auth**: Supabase (Postgres + Auth)
- **Hosting**: Vercel (frontend) — no backend server needed

The app talks **directly to Supabase from the browser**, protected by Row-Level Security policies. Guest checkout is supported.

---

## 🟢 First-time setup (~15 minutes, one time only)

### 1. Push code to GitHub
In Emergent's chat input bar, click **"Save to GitHub"** → choose a repo name → push.

### 2. Apply the guest-checkout policy in Supabase (one tiny SQL paste)

This is the *only* SQL you'll ever paste. It allows anonymous shoppers to create orders without signing in.

Open the SQL editor in your Supabase dashboard → **New query**, paste and click **Run**:

```sql
drop policy if exists "orders insert own" on public.orders;
create policy "orders insert own or guest" on public.orders for insert
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "order_items insert via order" on public.order_items;
create policy "order_items insert via order" on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id is null or o.user_id = auth.uid())
    )
  );
```

### 3. Deploy on Vercel
1. Go to **https://vercel.com** → log in with GitHub → "Add New Project"
2. Import the GitHub repo you just pushed
3. **Framework Preset**: leave as auto-detected (Vercel will read `vercel.json` at the repo root)
4. **Root Directory**: leave as `./` — the root `vercel.json` builds the frontend folder for you
5. **Build & Output Settings**: leave as auto (the root `vercel.json` already specifies `cd frontend && yarn install && CI=false yarn build` and `frontend/build` as the output)
6. **Environment Variables** — add these two:
   - `REACT_APP_SUPABASE_URL` = your Supabase project URL (e.g. `https://abcd.supabase.co`)
   - `REACT_APP_SUPABASE_ANON_KEY` = your Supabase **public anon** key

   You can find both in Supabase → Settings → API.
7. Click **Deploy**. ~90 seconds later your site is live at `https://<your-project>.vercel.app`

> **Tip:** if you'd rather have Vercel treat `frontend/` as the root, set **Root Directory** = `frontend` in Vercel project settings; the `frontend/vercel.json` file is also pre-configured for that case.

### 4. Connect your custom domain (optional)
Vercel → Project → Settings → Domains → "Add" → type your domain → follow DNS instructions.

---

## ✏️ Day-to-day: how to manage the live store

### Update products (no code, no deploy needed)
Use Supabase's spreadsheet UI:
- Supabase dashboard → Table Editor → `products`
- Click any cell → edit → press Enter
- Changes are live on your site within seconds (next page refresh)

**Common edits:**
- Price → edit `price` cell
- Hide product → set `stock = 0`
- New product → "Insert row"
- Change image → paste a new URL into `image_url`

### Update app code (design, layout, features)

```bash
# On your computer (one-time setup):
git clone https://github.com/YOUR_USERNAME/YOUR-REPO.git
cd YOUR-REPO/frontend
cp .env.example .env   # fill in your Supabase values
yarn install
yarn start   # opens http://localhost:3000

# Daily edits:
# 1. Edit any file
# 2. Save → hot reload
git add .
git commit -m "describe what changed"
git push

# Vercel auto-deploys on every push. Live in ~60 seconds.
```

---

## 🔐 Make yourself an admin
1. Sign up in your live app (or locally)
2. Supabase → Table Editor → `profiles` → find your row → set `is_admin = true` → save
3. Refresh the app. The admin icon appears in the navbar. `/admin` shows revenue, top products, and product CRUD.

## ⚙️ Optional: enable Google sign-in
Supabase → Authentication → Providers → Google → toggle on, paste OAuth credentials from Google Cloud Console. Add your Vercel URL as an authorised redirect.

---

## 💰 Costs at every layer
| Service | Free tier | Limit |
| --- | --- | --- |
| Supabase | Free | 500 MB DB, 50K monthly active users, 5 GB bandwidth |
| Vercel | Hobby (free) | 100 GB bandwidth/month, unlimited builds |
| GitHub | Free | unlimited public/private repos |

For a small business doing < 10K monthly visitors, you'll never pay a cent.

---

## 🧰 Troubleshooting Vercel deploys

| Symptom | Cause | Fix |
| --- | --- | --- |
| `yarn install --frozen-lockfile` error | Old config | Already fixed — current `vercel.json` uses plain `yarn install` |
| Build fails with `Treating warnings as errors` | CRA's CI=true behaviour | Already fixed — build runs with `CI=false` |
| Blank white page after deploy | Missing env vars | Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` in Vercel → Settings → Environment Variables, then redeploy |
| `supabase is not defined` runtime error | Old code | Already fixed in `CheckoutPage.jsx` |
| Routes 404 on refresh | Missing rewrites | Already configured in `vercel.json` |
