import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { CancellationError, reviewCancellation } from "./cancellation";

const url = process.env.TEST_DATABASE_URL;
const safe = Boolean(url && url.includes("test") && url !== process.env.DATABASE_URL);
const db = safe ? new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) }) : null;

test("cancellation integration requires beautymart_test", { skip: safe ? false : "Set TEST_DATABASE_URL to beautymart_test." }, () => assert.ok(db));

test("failed-payment cancellation restores only its store item once", { skip: safe ? false : "TEST_DATABASE_URL missing." }, async () => {
  const tag = randomUUID();
  const owner = await db!.user.create({ data: { fullName: tag, email: `o-${tag}@test.invalid`, passwordHash: "x", role: "STORE_OWNER" } });
  const other = await db!.user.create({ data: { fullName: tag, email: `x-${tag}@test.invalid`, passwordHash: "x", role: "STORE_OWNER" } });
  const user = await db!.user.create({ data: { fullName: tag, email: `c-${tag}@test.invalid`, passwordHash: "x", role: "CUSTOMER" } });
  const customer = await db!.customer.create({ data: { userId: user.userId, fullName: tag } });
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);
  const store = await db!.store.create({
    data: {
      ownerId: owner.userId,
      storeName: tag,
      subscription: {
        create: { planType: "TRIAL", status: "ACTIVE", isActive: true, startDate: now, endDate },
      },
    },
  });
  const category = await db!.category.create({ data: { storeId: store.storeId, categoryName: tag } });
  const product = await db!.product.create({ data: { storeId: store.storeId, categoryId: category.categoryId, productName: tag, price: 10, inventory: { create: { quantity: 0 } } } });
  const address = await db!.address.create({ data: { customerId: customer.customerId, region: "A", city: "B" } });
  const order = await db!.order.create({ data: { storeId: store.storeId, customerId: customer.customerId, addressId: address.addressId, orderNumber: tag, totalAmount: 10, finalAmount: 10, paymentStatus: "FAILED", items: { create: { productId: product.productId, quantity: 1, unitPrice: 10, totalPrice: 10 } } } });
  await db!.cancellationRequest.create({ data: { orderId: order.orderId, customerId: customer.customerId } });
  try {
    await assert.rejects(reviewCancellation(order.orderId, other.userId, "APPROVED", db!), CancellationError);
    await Promise.allSettled([reviewCancellation(order.orderId, owner.userId, "APPROVED", db!), reviewCancellation(order.orderId, owner.userId, "APPROVED", db!)]);
    const inventory = await db!.inventory.findUnique({ where: { productId: product.productId } });
    const request = await db!.cancellationRequest.findUnique({ where: { orderId: order.orderId } });
    assert.equal(inventory?.quantity, 1);
    assert.equal(request?.status, "APPROVED");
  } finally {
    await db!.cancellationRequest.deleteMany({ where: { orderId: order.orderId } });
    await db!.order.delete({ where: { orderId: order.orderId } });
    await db!.address.delete({ where: { addressId: address.addressId } });
    await db!.store.delete({ where: { storeId: store.storeId } });
    await db!.customer.delete({ where: { customerId: customer.customerId } });
    await db!.user.deleteMany({ where: { userId: { in: [owner.userId, other.userId, user.userId] } } });
  }
});

test.after(async () => { await db?.$disconnect(); });
