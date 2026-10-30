# BeautyMart payment setup and recovery

## Enabled customer payment method

Customer checkout currently enables **Chapa only**. Each store order has its
own Chapa payment record and is paid separately. This is deliberate: the
current schema gives each store independent orders and payments, and no verified
split-payment/subaccount agreement is configured.

Chapa requires these server-only variables:

- `CHAPA_SECRET_KEY`
- `CHAPA_CALLBACK_URL`
- `CHAPA_RETURN_URL`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`

Use a Chapa test secret key until the merchant compliance process is complete.
Configure the callback URL as a public HTTPS URL pointing to
`/api/payments/chapa/callback`. The application verifies the transaction with
Chapa before it marks an order paid; a browser return is never proof of payment.

## Telebirr and bank payments through Chapa

BeautyMart does **not** build separate Telebirr or bank integrations. Customer
orders and store-owner subscriptions use Chapa's hosted checkout. On that
Chapa page, the customer chooses from the payment methods Chapa has enabled
for the BeautyMart merchant account. This may include Telebirr and supported
bank methods.

The database provider remains `CHAPA`. This is correct: Chapa is the payment
processor that BeautyMart verifies with. The method selected inside Chapa is
not trusted from the browser and never changes an order or subscription to
paid by itself.

### Merchant setup required

Chapa's current v2 documentation provides `GET
https://api.chapa.global/v2/payments/methods` to list the methods enabled for a
merchant. A safe read-only check with BeautyMart's currently configured key
returned HTTP 401 on 30 October 2026. BeautyMart's working checkout currently
uses Chapa's older v1 hosted endpoint (`https://api.chapa.co/v1/...`), so do
not switch it to v2 or hard-code preferred method slugs without Chapa's
confirmation.

Ask Chapa support or the merchant-dashboard administrator to confirm:

1. Which test-mode methods are enabled for BeautyMart (for example
   `telebirr`, CBE Birr, or bank transfer).
2. Whether the current v1 key is permitted to call Chapa's v2 API, or whether
   a v2 test private key must be created in the dashboard.
3. That the same methods are approved separately for the live merchant account
   before launch.

Until that is confirmed, BeautyMart correctly shows no individual Telebirr or
bank button. The Chapa hosted page remains the only truthful source of which
methods the account can accept.

Official references: [Payment methods](https://docs.chapa.global/docs/v2/integrations/payment-methods),
[Hosted checkout](https://docs.chapa.global/docs/v2/integrations/accept-payment),
and [Chapa quick start](https://docs.chapa.global/docs/v2/getting-started).

## Checkout recovery

The browser sends an `Idempotency-Key` when it creates a checkout. The server
stores a customer-owned `CheckoutAttempt`; a retry with the same key returns
the existing store orders instead of reserving inventory twice. The customer is
redirected back to that persisted attempt after each verified Chapa callback.

When a Chapa initialization or verification result is uncertain, do not create
another checkout or release inventory. Use the existing order's payment status
endpoint to reconcile the persisted transaction reference with Chapa first.

## Database migration

The checkout-attempt migration was applied to the local `beautymart` database
after its backup was verified. For another environment, apply the same additive
migration only after confirming that environment and its backup:

```powershell
npx prisma migrate deploy
npx prisma generate
```

Review the migration and take a normal database backup before applying it to a
shared or production database. Do not use `prisma db push` as a production
migration substitute.

## Verification

```powershell
npm test
npx tsc --noEmit
npm run lint
npm run build
```

The tests cover deterministic request validation. Database concurrency and
provider callbacks require a disposable PostgreSQL test database and mocked
provider responses; they are not proven by the unit tests alone.

### PostgreSQL integration tests

The repository includes guarded checkout integration tests for stock races,
multi-store rollback, idempotency, and multi-store payment completion. They
only run when `TEST_DATABASE_URL` is set and its database name contains the
word `test`. They also reject the exact `DATABASE_URL` value. This prevents a
test from deleting fixture data in the local development database.

Create an empty, separate database such as `beautymart_test` with a PostgreSQL
role that can only access that test database. Do not use the existing
`beautymart` database. Apply the existing migrations to that separate database
using its own temporary environment configuration, then run:

```powershell
$env:TEST_DATABASE_URL = "postgresql://test-role:password@localhost:5432/beautymart_test?schema=public"
npm run test:integration
```

Do not paste the connection string or password into chat. The five tests skip
when this variable is absent; skipped tests are not evidence that PostgreSQL
concurrency has been verified.
