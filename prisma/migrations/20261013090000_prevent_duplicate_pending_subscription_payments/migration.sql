CREATE UNIQUE INDEX "SubscriptionPayments_OnePendingChapaPerStore"
ON "SubscriptionPayments" ("StoreId")
WHERE "Provider" = 'CHAPA' AND "Status" = 'PENDING';
