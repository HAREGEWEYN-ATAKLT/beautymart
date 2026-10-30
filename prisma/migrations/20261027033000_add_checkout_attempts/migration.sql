-- Adds a durable customer-owned checkout identity. Existing orders remain valid
-- because CheckoutAttemptId is nullable until an order is created by the new flow.
CREATE TYPE "CheckoutAttemptStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

CREATE TABLE "CheckoutAttempts" (
    "CheckoutAttemptId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "IdempotencyKey" TEXT NOT NULL,
    "Status" "CheckoutAttemptStatus" NOT NULL DEFAULT 'OPEN',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutAttempts_pkey" PRIMARY KEY ("CheckoutAttemptId")
);

ALTER TABLE "Orders" ADD COLUMN "CheckoutAttemptId" TEXT;

CREATE UNIQUE INDEX "CheckoutAttempts_CustomerId_IdempotencyKey_key"
ON "CheckoutAttempts"("CustomerId", "IdempotencyKey");

CREATE INDEX "CheckoutAttempts_CustomerId_idx"
ON "CheckoutAttempts"("CustomerId");

CREATE INDEX "Orders_CheckoutAttemptId_idx"
ON "Orders"("CheckoutAttemptId");

ALTER TABLE "CheckoutAttempts"
ADD CONSTRAINT "CheckoutAttempts_CustomerId_fkey"
FOREIGN KEY ("CustomerId") REFERENCES "Customers"("CustomerId")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Orders"
ADD CONSTRAINT "Orders_CheckoutAttemptId_fkey"
FOREIGN KEY ("CheckoutAttemptId") REFERENCES "CheckoutAttempts"("CheckoutAttemptId")
ON DELETE SET NULL ON UPDATE CASCADE;
