# MegaMart — E-commerce Marketplace

A real, working e-commerce storefront + admin dashboard built with **React + TypeScript + Vite + Supabase**.

## What this is

A rebuild of the original MegaMart static demo into a functioning marketplace: product catalog, search/filter/sort, cart, wishlist, authentication, checkout, order tracking, reviews, coupons, and an admin dashboard for managing products/categories/orders/customers. Every feature listed below is real and wired to a live database — nothing is a static mockup.

## What's NOT included (and why)

Being upfront:

- **Online card payments** — the checkout flow and payment method selector are built, but only Cash on Delivery is live. Wiring up Stripe (or another gateway) requires real API credentials and a server environment to verify webhooks, neither of which exist yet. See "Adding real payments" below.
- **SEO sitemap.xml generation / SSR** — this is a client-rendered SPA (Vite), so meta tags are static and there's no server-rendered per-product SEO. If SEO is critical, migrate to Next.js (the data layer in `src/lib/api.ts` ports over almost unchanged).
- **Image uploads in admin** — the admin product form takes an image URL rather than a file upload widget. Wire up Supabase Storage for real uploads when needed.
- **Elaborate multi-column mega menu** — a working category bar + listing filters exist; the full mega menu from the original brief was cut to keep the delivered scope solid rather than half-built.

Everything else — cart, wishlist, auth, addresses, checkout, coupons, reviews (gated to verified purchasers), order tracking, admin CRUD, low-stock alerts, RLS-based security — is fully functional against a real Supabase project.

## Architecture

- **Frontend:** React 19 + TypeScript + Vite, React Router, Zustand for cart/wishlist/auth state
- **Backend:** Supabase (Postgres + Auth + Row Level Security) — no separate API server needed
- **Server-side integrity:** all pricing, stock, and coupon validation happens inside a Postgres function (`place_order`) — the client never dictates the final order total

## Project structure

```
supabase/
  schema.sql        # run once — tables, RLS policies, place_order() function
  seed.sql          # sample categories/brands/products/coupon
src/
  lib/              # supabase client + all data-fetching functions
  store/            # zustand stores: auth, cart, wishlist
  components/       # Header, Footer, ProductCard, shared UI states
  pages/            # storefront pages
  pages/account/    # customer account pages
  pages/admin/      # admin dashboard pages
```

## Local setup

1. **Create a Supabase project** at https://supabase.com (free tier is enough to run this).
2. In the Supabase SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.example` to `.env` and fill in your project's URL + anon key (Project Settings → API).
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the app, sign up a user, then in the Supabase table editor set that user's `profiles.is_admin` to `true` to access `/admin`.

## Production build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## Deployment

This is a static SPA — deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, etc.). Set the same two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in your host's dashboard. Because this uses client-side routing, configure your host to rewrite all paths to `index.html`.

## Adding real payments (Stripe example)

1. Add `VITE_STRIPE_PUBLIC_KEY` to the frontend env, and `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` to a server environment (a Supabase Edge Function is the natural place — this repo doesn't include one yet).
2. Never call Stripe's secret key from the browser. Create a Supabase Edge Function that creates a PaymentIntent server-side, and a second one to verify webhooks and update `orders.payment_status`.
3. Extend `placeOrder()` in `src/lib/api.ts` to first create the order in a `pending` payment state, then confirm the PaymentIntent, then let the webhook flip it to `paid`.

## Admin access

Any user can sign up normally. To grant admin rights, set `is_admin = true` on their row in the `profiles` table via the Supabase dashboard (there's intentionally no self-service "become admin" button).

## Security notes

- Row Level Security is enabled on every table; customers can only read/write their own cart, wishlist, addresses, and orders.
- Product prices and stock are re-validated server-side inside `place_order()` — a tampered client-side price is never trusted.
- Coupons are validated server-side against min order amount, expiry, and usage limits at the moment of order placement.
- Reviews can only be submitted by users with a `delivered` order containing that product.

## Known limitations to disclose to a client

- COD-only checkout until a payment gateway is integrated.
- No SSR — product pages are indexable but won't have dynamically rendered meta tags without a Next.js migration.
- Admin image management is URL-based, not a file uploader, until Supabase Storage is wired in.
