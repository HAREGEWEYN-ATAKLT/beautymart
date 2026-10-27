/*
  Warnings:

  - A unique constraint covering the columns `[UserId]` on the table `Customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `UserId` to the `Customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customers" ADD COLUMN     "UserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customers_UserId_key" ON "Customers"("UserId");

-- AddForeignKey
ALTER TABLE "Customers" ADD CONSTRAINT "Customers_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;
