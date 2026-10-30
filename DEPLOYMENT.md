# BeautyMart deployment guide

This guide prepares BeautyMart for its first **production** deployment. It does
not replace Chapa merchant verification. Deploy the application first as a
staging/preview site, then enable real payments only after Chapa approves the
merchant account and payment channels.

## Recommended architecture

Use **one Vercel project** for the complete Next.js application:

```text
Customer browser
       |
       v
Vercel: BeautyMart pages + API routes + authentication
       |                 |                 |
       v                 v                 v
Managed PostgreSQL    Upstash Redis      Cloudinary
       |
       v
Chapa hosted checkout and server verification
```

Do not split this repository into a Vercel frontend and a Render backend. The
API routes, authentication, payment verification, and pages are already one
Next.js application. Splitting them would add CORS, cookie, callback, and
deployment complexity without helping BeautyMart.

For a commercial launch, use a Vercel paid team plan. Vercel Hobby is for
personal/non-commercial use and can run cron jobs only once per day. BeautyMart
needs its payment reconciliation job every 15 minutes.

## Before connecting Vercel

1. Create a **new empty production PostgreSQL database**. Do not point Vercel
   at the local `beautymart` database on your computer.
2. Choose a managed PostgreSQL provider. Prisma Postgres is the simplest match
   for this Prisma 7 project; Neon or Supabase PostgreSQL also work when they
   provide both pooled and direct PostgreSQL URLs.
3. Keep the local `beautymart` database and `beautymart_test` database private.
   They are not production databases.
4. Create a fresh, random `NEXTAUTH_SECRET` and `CRON_SECRET` for production.
   Never reuse test values or put them in Git.
5. Choose a final HTTPS domain, for example `https://www.example.com`. Chapa
   callbacks must use the final HTTPS domain, not `localhost` or a Vercel
   preview URL.

## Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add these as
server-side secrets. Add them to **Production** only first. Add separate values
to Preview later only if you create a separate preview database and Chapa test
configuration.

| Variable | Production value |
| --- | --- |
| `DATABASE_URL` | The managed database's pooled runtime connection URL. |
| `DIRECT_URL` | The managed database's direct connection URL, used only by Prisma CLI migrations. |
| `NEXTAUTH_URL` | Your final HTTPS domain, for example `https://www.example.com`. |
| `NEXTAUTH_SECRET` | A new long random secret. |
| `CHAPA_SECRET_KEY` | Chapa key for the selected environment. Use test until Chapa approves Live Mode. |
| `CHAPA_CALLBACK_URL` | `https://YOUR-DOMAIN/api/payments/chapa/callback` |
| `CHAPA_RETURN_URL` | `https://YOUR-DOMAIN/orders` |
| `CHAPA_SUBSCRIPTION_CALLBACK_URL` | `https://YOUR-DOMAIN/api/subscriptions/chapa/callback` |
| `CHAPA_SUBSCRIPTION_RETURN_URL` | `https://YOUR-DOMAIN/store-owner/subscription` |
| `CRON_SECRET` | A new long random secret, different from `NEXTAUTH_SECRET`. |
| `UPSTASH_REDIS_REST_URL` | Your Upstash REST URL. |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash REST token. |
| `TRUST_PROXY_HEADERS` | `true` on Vercel. |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret. |

Never add `TEST_DATABASE_URL` to Vercel Production. It is only for local
integration tests and must remain a separate disposable database.

## Database migration procedure

Do this once you have created the new managed production database and made a
backup plan with that provider:

1. Put its **direct** connection URL in a temporary local environment variable
   called `DIRECT_URL`. Do not paste it into chat or source code.
2. Confirm the target database name and host are the new production database.
3. Run:

   ```powershell
   npx prisma migrate status --config prisma7.config.ts
   npx prisma migrate deploy --config prisma7.config.ts
   npx prisma generate --config prisma7.config.ts
   npx prisma migrate status --config prisma7.config.ts
   ```

4. Confirm every migration is applied before creating the production Vercel
   deployment.

`prisma db push`, `migrate reset`, and a local database URL are not safe for
this production step.

## Scheduled jobs

`vercel.json` schedules:

- `/api/cron/payment-reconciliation` every 15 minutes;
- `/api/cron/subscription-reminders` once daily at `00:15 UTC` (`03:15` in
  Ethiopia while EAT is UTC+3).

When `CRON_SECRET` is set, Vercel automatically sends it as an Authorization
header to cron routes. BeautyMart checks that header before running either job.

Vercel can deliver a scheduled request more than once and does not retry failed
cron requests. BeautyMart's payment and notification writes are designed to be
idempotent: repeating the same verified result must not mark an order paid
twice or activate a subscription twice. Still review Vercel cron logs after
deployment.

## Safe first deployment order

1. Push the reviewed source to a private Git repository.
2. Import that repository into Vercel. Do **not** enter secrets in Git.
3. Add the Production environment variables above.
4. Configure the new managed database and apply migrations using the procedure
   above.
5. Deploy to a temporary Vercel production URL first.
6. Check login, product images, registration, one customer order, and one
   subscription test payment with Chapa **test** credentials.
7. Confirm the two cron jobs appear in **Vercel → Project → Settings → Cron
   Jobs** and their logs return HTTP 200.
8. Attach your final custom domain.
9. Change the four Chapa callback/return URLs to that final domain, redeploy,
   and test again in Chapa Test Mode.
10. Only after Chapa has approved the merchant and payment channels should you
    add Live Mode keys and accept real money.

## What is still external

- Chapa business compliance and enabling Telebirr/bank channels.
- A managed production PostgreSQL account and backup policy.
- A Vercel commercial plan for 15-minute payment reconciliation.
- A production domain and DNS configuration.
- Final browser tests on the deployed URL.
