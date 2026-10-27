/*
  Warnings:

  - A unique constraint covering the columns `[DeduplicationKey]` on the table `Notifications` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "DeduplicationKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Notifications_DeduplicationKey_key" ON "Notifications"("DeduplicationKey");
