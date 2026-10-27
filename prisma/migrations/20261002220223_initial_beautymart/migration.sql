-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'STORE_OWNER', 'CUSTOMER', 'GUEST');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('TRIAL', 'STARTER', 'STANDARD');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('TELEBIRR', 'CHAPA', 'SANTIMPAY', 'BANK');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'PAYMENT', 'INVENTORY', 'SUBSCRIPTION', 'SYSTEM');

-- CreateTable
CREATE TABLE "Users" (
    "UserId" TEXT NOT NULL,
    "FullName" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "PhoneNumber" TEXT,
    "PasswordHash" TEXT NOT NULL,
    "Role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("UserId")
);

-- CreateTable
CREATE TABLE "Stores" (
    "StoreId" TEXT NOT NULL,
    "OwnerId" TEXT NOT NULL,
    "StoreName" TEXT NOT NULL,
    "Description" TEXT,
    "LogoUrl" TEXT,
    "BannerUrl" TEXT,
    "Email" TEXT,
    "Phone" TEXT,
    "Address" TEXT,
    "Status" "StoreStatus" NOT NULL DEFAULT 'ACTIVE',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stores_pkey" PRIMARY KEY ("StoreId")
);

-- CreateTable
CREATE TABLE "Subscriptions" (
    "SubscriptionId" TEXT NOT NULL,
    "StoreId" TEXT NOT NULL,
    "PlanType" "PlanType" NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriptions_pkey" PRIMARY KEY ("SubscriptionId")
);

-- CreateTable
CREATE TABLE "Categories" (
    "CategoryId" TEXT NOT NULL,
    "StoreId" TEXT NOT NULL,
    "CategoryName" TEXT NOT NULL,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("CategoryId")
);

-- CreateTable
CREATE TABLE "Products" (
    "ProductId" TEXT NOT NULL,
    "StoreId" TEXT NOT NULL,
    "CategoryId" TEXT NOT NULL,
    "ProductName" TEXT NOT NULL,
    "Description" TEXT,
    "Price" DECIMAL(12,2) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("ProductId")
);

-- CreateTable
CREATE TABLE "ProductImages" (
    "ProductImageId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "ImageUrl" TEXT NOT NULL,
    "IsPrimary" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImages_pkey" PRIMARY KEY ("ProductImageId")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "InventoryId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0,
    "MinimumStock" INTEGER NOT NULL DEFAULT 0,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("InventoryId")
);

-- CreateTable
CREATE TABLE "Discounts" (
    "DiscountId" TEXT NOT NULL,
    "StoreId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "DiscountType" "DiscountType" NOT NULL,
    "DiscountValue" DECIMAL(12,2) NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Discounts_pkey" PRIMARY KEY ("DiscountId")
);

-- CreateTable
CREATE TABLE "ProductDiscounts" (
    "ProductDiscountId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "DiscountId" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductDiscounts_pkey" PRIMARY KEY ("ProductDiscountId")
);

-- CreateTable
CREATE TABLE "Customers" (
    "CustomerId" TEXT NOT NULL,
    "FullName" TEXT NOT NULL,
    "Email" TEXT,
    "PhoneNumber" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("CustomerId")
);

-- CreateTable
CREATE TABLE "Addresses" (
    "AddressId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "Region" TEXT NOT NULL,
    "City" TEXT NOT NULL,
    "SubCity" TEXT,
    "Woreda" TEXT,
    "HouseNumber" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Addresses_pkey" PRIMARY KEY ("AddressId")
);

-- CreateTable
CREATE TABLE "Orders" (
    "OrderId" TEXT NOT NULL,
    "StoreId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "AddressId" TEXT NOT NULL,
    "OrderNumber" TEXT NOT NULL,
    "TotalAmount" DECIMAL(12,2) NOT NULL,
    "DiscountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "FinalAmount" DECIMAL(12,2) NOT NULL,
    "PaymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "OrderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("OrderId")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "OrderItemId" TEXT NOT NULL,
    "OrderId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(12,2) NOT NULL,
    "DiscountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "TotalPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("OrderItemId")
);

-- CreateTable
CREATE TABLE "StorePayments" (
    "StorePaymentId" TEXT NOT NULL,
    "StoreId" TEXT NOT NULL,
    "Provider" "PaymentProvider" NOT NULL,
    "AccountName" TEXT,
    "AccountNumber" TEXT,
    "MerchantKey" TEXT,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorePayments_pkey" PRIMARY KEY ("StorePaymentId")
);

-- CreateTable
CREATE TABLE "Payments" (
    "PaymentId" TEXT NOT NULL,
    "OrderId" TEXT NOT NULL,
    "StoreId" TEXT NOT NULL,
    "Provider" "PaymentProvider" NOT NULL,
    "TransactionReference" TEXT,
    "Amount" DECIMAL(12,2) NOT NULL,
    "Status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "PaidAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("PaymentId")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "NotificationId" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Message" TEXT NOT NULL,
    "NotificationType" "NotificationType" NOT NULL,
    "IsRead" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("NotificationId")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "AnalyticsId" TEXT NOT NULL,
    "StoreId" TEXT NOT NULL,
    "TotalOrders" INTEGER NOT NULL DEFAULT 0,
    "TotalProducts" INTEGER NOT NULL DEFAULT 0,
    "TotalCustomers" INTEGER NOT NULL DEFAULT 0,
    "TotalRevenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "LastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("AnalyticsId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- CreateIndex
CREATE INDEX "Stores_OwnerId_idx" ON "Stores"("OwnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriptions_StoreId_key" ON "Subscriptions"("StoreId");

-- CreateIndex
CREATE INDEX "Categories_StoreId_idx" ON "Categories"("StoreId");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_StoreId_CategoryName_key" ON "Categories"("StoreId", "CategoryName");

-- CreateIndex
CREATE INDEX "Products_StoreId_idx" ON "Products"("StoreId");

-- CreateIndex
CREATE INDEX "Products_CategoryId_idx" ON "Products"("CategoryId");

-- CreateIndex
CREATE INDEX "ProductImages_ProductId_idx" ON "ProductImages"("ProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_ProductId_key" ON "Inventory"("ProductId");

-- CreateIndex
CREATE INDEX "Discounts_StoreId_idx" ON "Discounts"("StoreId");

-- CreateIndex
CREATE INDEX "ProductDiscounts_ProductId_idx" ON "ProductDiscounts"("ProductId");

-- CreateIndex
CREATE INDEX "ProductDiscounts_DiscountId_idx" ON "ProductDiscounts"("DiscountId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductDiscounts_ProductId_DiscountId_key" ON "ProductDiscounts"("ProductId", "DiscountId");

-- CreateIndex
CREATE INDEX "Addresses_CustomerId_idx" ON "Addresses"("CustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_OrderNumber_key" ON "Orders"("OrderNumber");

-- CreateIndex
CREATE INDEX "Orders_StoreId_idx" ON "Orders"("StoreId");

-- CreateIndex
CREATE INDEX "Orders_CustomerId_idx" ON "Orders"("CustomerId");

-- CreateIndex
CREATE INDEX "Orders_AddressId_idx" ON "Orders"("AddressId");

-- CreateIndex
CREATE INDEX "OrderItems_OrderId_idx" ON "OrderItems"("OrderId");

-- CreateIndex
CREATE INDEX "OrderItems_ProductId_idx" ON "OrderItems"("ProductId");

-- CreateIndex
CREATE INDEX "StorePayments_StoreId_idx" ON "StorePayments"("StoreId");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_TransactionReference_key" ON "Payments"("TransactionReference");

-- CreateIndex
CREATE INDEX "Payments_OrderId_idx" ON "Payments"("OrderId");

-- CreateIndex
CREATE INDEX "Payments_StoreId_idx" ON "Payments"("StoreId");

-- CreateIndex
CREATE INDEX "Notifications_UserId_idx" ON "Notifications"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_StoreId_key" ON "Analytics"("StoreId");

-- AddForeignKey
ALTER TABLE "Stores" ADD CONSTRAINT "Stores_OwnerId_fkey" FOREIGN KEY ("OwnerId") REFERENCES "Users"("UserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Stores"("StoreId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Stores"("StoreId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Stores"("StoreId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Categories"("CategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImages" ADD CONSTRAINT "ProductImages_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Products"("ProductId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Products"("ProductId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discounts" ADD CONSTRAINT "Discounts_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Stores"("StoreId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDiscounts" ADD CONSTRAINT "ProductDiscounts_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Products"("ProductId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDiscounts" ADD CONSTRAINT "ProductDiscounts_DiscountId_fkey" FOREIGN KEY ("DiscountId") REFERENCES "Discounts"("DiscountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addresses" ADD CONSTRAINT "Addresses_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customers"("CustomerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Stores"("StoreId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customers"("CustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_AddressId_fkey" FOREIGN KEY ("AddressId") REFERENCES "Addresses"("AddressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Orders"("OrderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Products"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePayments" ADD CONSTRAINT "StorePayments_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Stores"("StoreId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Orders"("OrderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Stores"("StoreId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Stores"("StoreId") ON DELETE CASCADE ON UPDATE CASCADE;
