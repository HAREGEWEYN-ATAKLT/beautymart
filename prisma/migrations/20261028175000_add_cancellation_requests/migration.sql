-- Add cancellation requests without changing or deleting existing orders.
CREATE TYPE "CancellationRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED');

CREATE TABLE "CancellationRequests" (
    "CancellationRequestId" TEXT NOT NULL,
    "OrderId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "Status" "CancellationRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "Reason" TEXT,
    "RequestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ReviewedAt" TIMESTAMP(3),
    "ReviewedByUserId" TEXT,
    "ReviewNote" TEXT,
    "InventoryRestoredAt" TIMESTAMP(3),
    CONSTRAINT "CancellationRequests_pkey" PRIMARY KEY ("CancellationRequestId")
);

CREATE UNIQUE INDEX "CancellationRequests_OrderId_key" ON "CancellationRequests"("OrderId");
CREATE INDEX "CancellationRequests_CustomerId_idx" ON "CancellationRequests"("CustomerId");
CREATE INDEX "CancellationRequests_Status_idx" ON "CancellationRequests"("Status");

ALTER TABLE "CancellationRequests" ADD CONSTRAINT "CancellationRequests_OrderId_fkey"
  FOREIGN KEY ("OrderId") REFERENCES "Orders"("OrderId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CancellationRequests" ADD CONSTRAINT "CancellationRequests_CustomerId_fkey"
  FOREIGN KEY ("CustomerId") REFERENCES "Customers"("CustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;
