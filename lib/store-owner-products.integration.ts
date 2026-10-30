import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.TEST_DATABASE_URL;
const safe = Boolean(url && url.includes("beautymart_test") && url !== process.env.DATABASE_URL);
const db = safe ? new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) }) : null;

test("store-owner product integrity tests require beautymart_test", { skip: safe ? false : "Set TEST_DATABASE_URL to beautymart_test." }, () => assert.ok(db));

test("cross-store writes fail, stale stock writes fail, and sold products can be deactivated", { skip: safe ? false : "TEST_DATABASE_URL missing." }, async () => {
  const tag = randomUUID();
  const ownerA = await db!.user.create({ data: { fullName: tag, email: `a-${tag}@test.invalid`, passwordHash: "x", role: "STORE_OWNER" } });
  const ownerB = await db!.user.create({ data: { fullName: tag, email: `b-${tag}@test.invalid`, passwordHash: "x", role: "STORE_OWNER" } });
  const customerUser = await db!.user.create({ data: { fullName: tag, email: `c-${tag}@test.invalid`, passwordHash: "x", role: "CUSTOMER" } });
  const customer = await db!.customer.create({ data: { userId: customerUser.userId, fullName: tag } });
  const store = await db!.store.create({ data: { ownerId: ownerA.userId, storeName: tag } });
  const category = await db!.category.create({ data: { storeId: store.storeId, categoryName: tag } });
  const product = await db!.product.create({ data: { storeId: store.storeId, categoryId: category.categoryId, productName: tag, price: 10, inventory: { create: { quantity: 10 } } }, include: { inventory: true } });
  const address = await db!.address.create({ data: { customerId: customer.customerId, region: "A", city: "B" } });
  try {
    const crossStore = await db!.product.updateMany({ where: { productId: product.productId, store: { ownerId: ownerB.userId } }, data: { price: 99 } });
    assert.equal(crossStore.count, 0);
    const version = product.inventory!.updatedAt;
    await db!.inventory.update({ where: { productId: product.productId }, data: { quantity: { decrement: 1 } } });
    const stale = await db!.inventory.updateMany({ where: { productId: product.productId, updatedAt: version }, data: { quantity: 10 } });
    assert.equal(stale.count, 0);
    const order = await db!.order.create({ data: { storeId: store.storeId, customerId: customer.customerId, addressId: address.addressId, orderNumber: tag, totalAmount: 10, finalAmount: 10, items: { create: { productId: product.productId, quantity: 1, unitPrice: 10, totalPrice: 10 } } } });
    const count = await db!.orderItem.count({ where: { productId: product.productId } });
    assert.equal(count, 1);
    await db!.product.update({ where: { productId: product.productId }, data: { isActive: false } });
    assert.equal((await db!.product.findUnique({ where: { productId: product.productId } }))?.isActive, false);
    await db!.order.delete({ where: { orderId: order.orderId } });
  } finally {
    await db!.address.deleteMany({ where: { customerId: customer.customerId } });
    await db!.store.delete({ where: { storeId: store.storeId } });
    await db!.customer.delete({ where: { customerId: customer.customerId } });
    await db!.user.deleteMany({ where: { userId: { in: [ownerA.userId, ownerB.userId, customerUser.userId] } } });
  }
});

test.after(async () => { await db?.$disconnect(); });
