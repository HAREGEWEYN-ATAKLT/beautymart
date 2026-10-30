# BeautyMart

BeautyMart is an Ethiopia-focused marketplace where customers discover beauty
products from independent stores, store owners manage their businesses, and
platform administrators oversee marketplace operations.

> **Project status:** active development. BeautyMart has local checkout,
> subscription, notification, and store-management flows, but it is **not yet a
> live-money production service**. Read [DEPLOYMENT.md](./DEPLOYMENT.md) before
> any public deployment.

## Features

- Customer accounts, product/store discovery, search, cart, multi-store orders,
  payment recovery, notifications, and cancellation requests.
- Store-owner product, inventory, category, discount, order, branding, and
  subscription management.
- Super-admin management of users, stores, payments, subscriptions, analytics,
  and notifications.
- Chapa hosted checkout for customer orders and store subscriptions.
- Server-side payment verification, database transactions, ownership checks,
  image validation, and Upstash Redis rate limiting.

## Architecture

```text
Browser
  │
  ▼
Next.js App Router pages and Route Handlers
  │                 │                │
  ▼                 ▼                ▼
PostgreSQL       Upstash Redis    Cloudinary
Prisma ORM       rate limits      validated images
  │
  ▼
Chapa hosted checkout → server-side verification → orders/subscriptions
```

The browser never decides that a payment succeeded. BeautyMart verifies the
provider result on the server before it marks an order paid or activates a
subscription.

## Technology

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS and existing CSS modules/global CSS |
| Database | PostgreSQL with Prisma ORM 7 and `@prisma/adapter-pg` |
| Authentication | NextAuth Credentials provider with Argon2 password hashing |
| Images | Cloudinary |
| Payments | Chapa hosted checkout and server-side verification |
| Shared rate limiting | Upstash Redis |
| Intended hosting | Vercel plus managed PostgreSQL |

## Roles and business rules

| Role | Main access |
| --- | --- |
| `CUSTOMER` | Browse, purchase, and see only their own orders/notifications |
| `STORE_OWNER` | Manage one owned store, products, inventory, orders, and subscription |
| `SUPER_ADMIN` | Manage marketplace operations and store status |
| `GUEST` | Browse public marketplace pages |

- A new store receives a one-month trial.
- Starter is **3,000 ETB for six months**; Standard is **5,000 ETB for twelve months**.
- Only store owners pay BeautyMart subscription fees.
- A verified paid subscription begins immediately and replaces unused trial time.
- Store suspension and subscription expiry are separate controls.
- Store owners cannot fulfil unpaid orders.
- Chapa redirects alone are not proof of payment.

## Local setup

### Requirements

- Node.js 20 or later
- PostgreSQL 17 or compatible PostgreSQL server
- Chapa **test** account/key for safe payment development
- Cloudinary account for image uploads
- Upstash Redis for production-like rate-limit testing

### Install and configure

```powershell
npm install
Copy-Item .env.example .env
```

Fill `.env` on your own computer. Never commit database URLs, Chapa keys,
Cloudinary secrets, Upstash tokens, or cron secrets. `.env*` is ignored by Git.

The full variable-name list is in [.env.example](./.env.example).

### Database safety

Use a local development database such as `beautymart`. Confirm the target and
take a backup before applying a new migration.

```powershell
npx prisma validate --config prisma7.config.ts
npx prisma migrate status --config prisma7.config.ts
npx prisma migrate deploy --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
```

Do **not** use `prisma db push` or `prisma migrate reset` against a shared or
important database.

### Run locally

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variable groups

| Variables | Purpose |
| --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | PostgreSQL runtime and migration connections |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | Authentication URL and signing secret |
| `CHAPA_*` | Server-only key and callback/return URLs |
| `UPSTASH_REDIS_*` | Shared account and payment rate limiting |
| `CLOUDINARY_*` | Validated store and product image uploads |
| `CRON_SECRET` | Protects scheduled reconciliation/subscription jobs |
| `TRUST_PROXY_HEADERS` | `false` locally; `true` only after Vercel deployment |

## Payments and subscriptions

### Customer orders

1. Checkout creates one order and one Chapa payment record for each store.
2. Inventory is reserved inside the order transaction.
3. The customer is redirected to Chapa hosted checkout.
4. A Chapa callback, status recovery, or scheduled job verifies the provider
   result on the server.
5. Only a matching verified success marks that store order as paid.

Pending or uncertain Chapa attempts are kept separate from new cart items. The
system does not automatically release their stock merely because a browser was
closed, because the provider payment might still succeed.

### Store subscriptions

The server calculates the Starter or Standard price, creates a pending
subscription-payment record, and opens Chapa hosted checkout. A verified
payment activates the plan once; duplicate callbacks cannot extend it again.

### Telebirr and bank methods

BeautyMart does not collect Telebirr or bank credentials itself. Chapa controls
the methods shown on its hosted checkout page. Chapa merchant compliance and
channel approval are required before Telebirr or individual banks can be
offered to real customers.

Read [PAYMENT_SETUP.md](./PAYMENT_SETUP.md) for payment recovery, test-mode
guidance, and PostgreSQL integration-test preparation.

## Scheduled jobs

- `/api/cron/payment-reconciliation` verifies pending Chapa payments.
- `/api/cron/subscription-reminders` expires subscriptions and sends reminders.

Both require `Authorization: Bearer <CRON_SECRET>`. The prepared
[vercel.json](./vercel.json) schedules payment reconciliation every 15 minutes
and subscription reminders daily in production.

## Verification

```powershell
npx prisma validate --config prisma7.config.ts
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Database integration tests require a separate disposable PostgreSQL database:

```powershell
$env:TEST_DATABASE_URL = "postgresql://TEST_USER:TEST_PASSWORD@localhost:5432/beautymart_test?schema=public"
npm run test:integration
```

Never point `TEST_DATABASE_URL` at development or production. The suite refuses
to run when its URL is missing, does not contain `test`, or exactly equals
`DATABASE_URL`.

## Security notes

- Server-side role and ownership checks protect customer/store/admin data.
- Passwords use Argon2 hashes; they are never stored as plain text.
- Registration/login rate limits fail closed if configured Redis is unavailable;
  payment initialization stays available during a limiter outage.
- Image uploads validate type and ownership before reaching Cloudinary.
- Cancellation requests never pretend to refund a Chapa payment.
- Secrets stay server-side and must never be placed in browser code or Git.

## Deployment

Read [DEPLOYMENT.md](./DEPLOYMENT.md) before deploying. It covers Vercel,
managed PostgreSQL, production variables, safe migrations, Chapa callbacks,
scheduled jobs, custom domains, and final manual testing.

Do not deploy with local database URLs, test secrets, missing backups, or
unverified payment callbacks.

## Repository safety

- Do not commit `.env`, backups, private keys, or provider tokens.
- Do not use destructive Git commands to remove unreviewed work.
- Do not reset, drop, or recreate an existing database to solve a migration problem.
- Review `git diff` before every commit.
