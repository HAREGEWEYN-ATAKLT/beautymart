-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Subscriptions" ADD COLUMN     "Status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';
