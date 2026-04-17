# ⚡ RITHTOPUP

A full-stack game top-up website built with Next.js 14, PostgreSQL, and Prisma. Sell game credits (Mobile Legends Diamonds, Free Fire Diamonds, PUBG UC, Genshin Genesis Crystals, etc.) with ABA Pay and Binance Pay checkout, instant order tracking, and a complete admin dashboard.

Inspired by sites like rithtopupbot.com and topup.bot.

![RITHTOPUP](https://img.shields.io/badge/Next.js-14-black) ![Postgres](https://img.shields.io/badge/Postgres-16-blue) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## ✨ Features

### Customer site
- Homepage with featured games, hero, FAQ
- Game detail pages with package selection
- Three-step checkout: choose package → enter UID → pay
- Support for games that require a server (Genshin, HSR, etc.)
- Order tracking by order number
- Fully responsive, dark theme, custom orange/gold palette

### Admin dashboard
- Secure JWT login
- Live stats (total orders, revenue, pending, delivered, failed)
- Orders list with filtering + search (order #, UID, email)
- Order detail with status transitions (PAID → PROCESSING → DELIVERED etc.)
- Games CRUD (add, edit, delete, toggle featured/active)
- Products CRUD (packages, bonuses, badges, pricing)
- Site settings (exchange rate, announcement, maintenance mode)

### Backend
- Prisma schema with Orders, Games, Products, Admins, Settings
- Payment adapter supporting **simulation mode** for dev + real ABA Pay (PayWay) and Binance Pay stubs
- Webhook endpoints for both gateways with HMAC signature verification
- Seed script with realistic pricing for 6 popular games and ~50 packages

---

## 📦 Quick Start

### 1. Clone + install

```bash
npm install
```

### 2. Create a Postgres database

Fastest free options:
- **[Supabase](https://supabase.com)** — free tier, get `Connection String (URI)` from Project Settings → Database
- **[Neon](https://neon.tech)** — free tier, serverless Postgres
- **[Railway](https://railway.app)** — free $5/month credit

Or run locally:
```bash
docker run -d --name rithtopup-db -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16
# DATABASE_URL="postgresql://postgres:secret@localhost:5432/postgres"
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="$(openssl rand -base64 32)"
ADMIN_EMAIL="admin@rithtopup.com"
ADMIN_PASSWORD="ChooseAStrongPassword!"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
PAYMENT_SIMULATION_MODE="true"
```

### 4. Set up the database

```bash
npm run db:push     # creates tables
npm run db:seed     # seeds games, products, admin user
```

### 5. Run dev server

```bash
npm run dev
```

Open **http://localhost:3000** for the customer site, and **http://localhost:3000/admin** for the admin panel (login with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

---

## 🚀 Deploy to Production

### Option A — Vercel + Supabase (recommended, easiest)

1. Create a free Supabase project → copy the `DATABASE_URL`
2. Push this repo to GitHub
3. Import into Vercel → add the env vars from `.env.example`
4. After first deploy, run seeds from your machine pointing at prod:
   ```bash
   DATABASE_URL="your-prod-url" npm run db:push
   DATABASE_URL="your-prod-url" npm run db:seed
   ```

### Option B — Railway (all-in-one)

1. New Project → deploy from GitHub repo
2. Add a PostgreSQL plugin
3. Railway auto-injects `DATABASE_URL`; add the other env vars
4. In the deploy logs, run the seed: `npm run db:seed`

---

## 💳 Connecting Real Payment Gateways

The site ships in **simulation mode** — payments auto-complete after ~3 seconds so you can test the full flow end-to-end. To go live:

### ABA Pay (PayWay)
1. Register a merchant account at https://www.payway.com.kh (requires Cambodian business license)
2. Get your `merchant_id` and `api_key` from the PayWay dashboard
3. Add to `.env`:
   ```env
   ABA_PAY_MERCHANT_ID="your_merchant_id"
   ABA_PAY_API_KEY="your_api_key"
   ABA_PAY_WEBHOOK_SECRET="your_webhook_secret"
   PAYMENT_SIMULATION_MODE="false"
   ```
4. In the PayWay dashboard, set your webhook URL to:
   `https://yourdomain.com/api/payment/webhook/ABA_PAY`
5. Open `lib/payment.ts` → `initiateAbaPay` function. The signature hashing is already implemented — you just need to replace the stub return with a real POST to `/api/payment-gateway/v1/payments/purchase` per the PayWay docs.

### Binance Pay
1. Apply for a Binance Pay merchant account at https://merchant.binance.com
2. Get API key + secret from the merchant dashboard
3. Add to `.env`:
   ```env
   BINANCE_PAY_MERCHANT_ID="your_merchant_id"
   BINANCE_PAY_API_KEY="your_api_key"
   BINANCE_PAY_SECRET_KEY="your_secret"
   PAYMENT_SIMULATION_MODE="false"
   ```
4. Register webhook URL in merchant dashboard:
   `https://yourdomain.com/api/payment/webhook/BINANCE_PAY`
5. Open `lib/payment.ts` → `initiateBinancePay`. The HMAC signature is implemented — replace the stub return with a POST to `https://bpay.binanceapi.com/binancepay/openapi/v2/order`.

### Fulfillment
Once a payment webhook fires and marks an order `PAID`, you need to actually deliver the game credits. Options:

**Option 1 — Manual (simplest to start)**: Admin logs into `/admin/orders/[id]` and clicks "Set DELIVERED" after manually topping up the player's UID from their own game-reseller account.

**Option 2 — Automated via reseller API**: If you sign up with a licensed game distributor (Smile.one, Codashop reseller program, Razer Gold, UniPin, etc.), they usually expose a REST API. In `app/api/payment/webhook/[method]/route.ts`, after the `order.update({ status: "PAID" })` call, add a job to call the reseller's API with the `playerUid` and product SKU.

---

## 🧱 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT sessions with `jose` + bcrypt password hashing
- **Styling**: Tailwind CSS + custom design tokens
- **Validation**: Zod
- **Fonts**: Space Grotesk (display) + Plus Jakarta Sans (body) + JetBrains Mono
- **Deployment**: Designed for Vercel / Railway / any Node host

---

## 📁 Project Structure

```
rithtopup/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── games/[slug]/page.tsx    # Game detail + top-up form
│   ├── order/page.tsx           # Order tracking
│   ├── admin/                   # Admin dashboard (all pages)
│   └── api/
│       ├── games/               # Public games list
│       ├── products/            # Public products list
│       ├── orders/              # Create + lookup orders
│       ├── payment/
│       │   ├── simulate/        # Dev simulation endpoint
│       │   └── webhook/[method] # Real gateway webhooks
│       └── admin/               # Protected admin CRUD
├── components/                  # React components
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   ├── auth.ts                  # JWT session helpers
│   ├── payment.ts               # Gateway adapter
│   └── utils.ts                 # Order number gen, formatters
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Sample data seed
├── middleware.ts                # Admin route protection
└── .env.example                 # Required env vars
```

---

## 🔑 Default Admin Login

After running `npm run db:seed` with default env:
- **URL**: http://localhost:3000/admin/login
- **Email**: admin@rithtopup.com
- **Password**: ChangeMeNow123!

**Change this immediately in production** by editing `ADMIN_PASSWORD` in `.env` before seeding, or by running `npm run db:studio` → Admin table → update `passwordHash`.

---

## ⚠️ Legal & Business Notes

This is a **technical template**, not a business. Before going live:
1. You need a **registered business** (Cambodia or elsewhere) to open ABA Pay merchant accounts
2. You need **reseller agreements** with game publishers or a licensed distributor (you can't legally resell Mobile Legends/Free Fire/etc. credits without one)
3. The game names, logos, and currency names belong to their respective publishers — you may need to update branding terms depending on your distributor's requirements
4. Add a proper Terms of Service and Refund Policy before taking real money

---

## 🛠️ Common Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Start production server
npm run db:push       # Apply schema changes to DB
npm run db:seed       # Populate games + products + admin
npm run db:studio     # Visual DB editor (Prisma Studio)
```

---

## 📝 License

MIT — do whatever you want with this code. No warranty.
