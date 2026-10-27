-- CreateTable
CREATE TABLE "SubscriptionPayments" (
    "SubscriptionPaymentId" TEXT NOT NULL,
    "StoreId" TEXT NOT NULL,
    "SubscriptionId" TEXT NOT NULL,
    "PlanType" "PlanType" NOT NULL,
    "Provider" "PaymentProvider" NOT NULL,
    "TransactionReference" TEXT,
    "Amount" DECIMAL(12,2) NOT NULL,
    "Currency" TEXT NOT NULL DEFAULT 'ETB',
    "Status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "PaidAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPayments_pkey" PRIMARY KEY ("SubscriptionPaymentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayments_TransactionReference_key" ON "SubscriptionPayments"("TransactionReference");

-- CreateIndex
CREATE INDEX "SubscriptionPayments_StoreId_idx" ON "SubscriptionPayments"("StoreId");

-- CreateIndex
CREATE INDEX "SubscriptionPayments_SubscriptionId_idx" ON "SubscriptionPayments"("SubscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionPayments_Status_idx" ON "SubscriptionPayments"("Status");


-- AddForeignKey
ALTER TABLE "SubscriptionPayments"
ADD CONSTRAINT "SubscriptionPayments_StoreId_fkey"
FOREIGN KEY ("StoreId")
REFERENCES "Stores"("StoreId")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayments"
ADD CONSTRAINT "SubscriptionPayments_SubscriptionId_fkey"
FOREIGN KEY ("SubscriptionId")
REFERENCES "Subscriptions"("SubscriptionId")
ON DELETE RESTRICT
ON UPDATE CASCADE;

