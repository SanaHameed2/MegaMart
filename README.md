# MegaMart

A modern e-commerce marketplace built with React 19, TypeScript, Tailwind CSS, Supabase, and GraphQL.

**Live Demo:** [megamart-eta.vercel.app](https://megamart-eta.vercel.app)

---

## Features

- **Modern UI** — Tailwind design system, responsive layout, smooth animations
- **Product catalog** — filters (brand, price, rating, stock), sort, search
- **Product detail** — image gallery, specifications, reviews, related items
- **Cart and Wishlist** — persistent for guests and authenticated users
- **Authentication** — signup, login, password reset via Supabase
- **Checkout** — Cash on Delivery (Stripe-ready architecture)
- **Orders** — history, tracking, individual order view
- **Reviews** — gated to verified purchasers
- **Admin dashboard** — products, categories, orders, customers

---

## 🔒 Security Audit

This project underwent a comprehensive security audit covering **14 database tables**, **40+ Row-Level Security (RLS) policies**, and **3 live attack simulations** (IDOR, privilege escalation) against the production Supabase instance. Every finding was verified with SQL queries and browser-console tests — not just policy definitions.

**Result:** 9 vulnerabilities identified and fixed, 0 open findings.

📄 **[Read the full Security Audit Report →](./docs/SECURITY_AUDIT.md)**

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS, PostCSS, custom design tokens |
| **Routing** | React Router v6 |
| **State** | Zustand (cart, wishlist, auth) |
| **Data Fetching** | Apollo Client v3, Supabase pg_graphql |
| **Backend** | Supabase (PostgreSQL, Auth, RLS, Storage) |
| **Icons** | Lucide React |
| **Deployment** | Vercel |
| **Version Control** | Git, GitHub |

---

## Quick Start

```bash
git clone https://github.com/SanaHameed2/MegaMart.git
cd MegaMart
npm install
cp .env.example .env    # add Supabase URL + anon key
npm run dev
```
