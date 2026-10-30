import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import {
  CheckoutError,
  completeCheckoutAttemptIfPaid,
  createOrRecoverCheckout,
} from "./checkout";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

function databaseName(url: string) {
  const withoutQuery = url.split("?", 1)[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf("/") + 1).toLowerCase();
}

const safeTestDatabase = Boolean(
  testDatabaseUrl &&
    databaseName(testDatabaseUrl).includes("test") &&
    testDatabaseUrl !== process.env.DATABASE_URL
);

const db = safeTestDatabase
  ? new PrismaClient({ adapter: new PrismaPg({ connectionString: testDatabaseUrl! }) })
  : null;

type Fixture = {
  customerIds: string[];
  customerUserIds: string[];
  ownerUserIds: string[];
  storeIds: string[];
  productIds: string[];
};

function checkoutBody(storeId: string, productId: string, quantity: number) {
  return {
    paymentMethod: "Chapa",
    region: "Addis Ababa",
    city: "Addis Ababa",
    items: [{ id: productId, storeId, quantity }],
  };
}

async function createFixture(storeStocks: number[], customerCount: number): Promise<Fixture> {
  if (!db) throw new Error("A safe test database is required.");
  const suffix = randomUUID();
  const fixture: Fixture = {
    customerIds: [],
    customerUserIds: [],
    ownerUserIds: [],
    storeIds: [],
    productIds: [],
  };

  for (let index = 0; index < storeStocks.length; index += 1) {
    const owner = await db.user.create({
      data: {
        fullName: `Integration owner ${suffix} ${index}`,
        email: `integration-owner-${suffix}-${index}@example.test`,
        passwordHash: "integration-test-only",
        role: "STORE_OWNER",
      },
    });
    fixture.ownerUserIds.push(owner.userId);

    const store = await db.store.create({
      data: {
        ownerId: owner.userId,
        storeName: `Integration store ${suffix} ${index}`,
        subscription: {
          create: {
            planType: "TRIAL",
            status: "ACTIVE",
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
      },
    });
    const category = await db.category.create({
      data: {
        storeId: store.storeId,
        categoryName: `Integration category ${suffix} ${index}`,
      },
    });
    const product = await db.product.create({
      data: {
        storeId: store.storeId,
        categoryId: category.categoryId,
        productName: `Integration product ${suffix} ${index}`,
        price: 100,
        inventory: { create: { quantity: storeStocks[index], minimumStock: 0 } },
      },
    });
    fixture.storeIds.push(store.storeId);
    fixture.productIds.push(product.productId);
  }

  for (let index = 0; index < customerCount; index += 1) {
    const user = await db.user.create({
      data: {
        fullName: `Integration customer ${suffix} ${index}`,
        email: `integration-customer-${suffix}-${index}@example.test`,
        passwordHash: "integration-test-only",
        role: "CUSTOMER",
      },
    });
    const customer = await db.customer.create({
      data: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
      },
    });
    fixture.customerUserIds.push(user.userId);
    fixture.customerIds.push(customer.customerId);
  }

  return fixture;
}

async function removeFixture(fixture: Fixture) {
  if (!db) return;
  await db.order.deleteMany({ where: { customerId: { in: fixture.customerIds } } });
  await db.checkoutAttempt.deleteMany({ where: { customerId: { in: fixture.customerIds } } });
  await db.address.deleteMany({ where: { customerId: { in: fixture.customerIds } } });
  await db.store.deleteMany({ where: { storeId: { in: fixture.storeIds } } });
  await db.customer.deleteMany({ where: { customerId: { in: fixture.customerIds } } });
  await db.user.deleteMany({
    where: { userId: { in: [...fixture.customerUserIds, ...fixture.ownerUserIds] } },
  });
}

test("checkout PostgreSQL integration tests require a distinct test database", {
  skip: safeTestDatabase ? false : "Set TEST_DATABASE_URL to a distinct database with 'test' in its name.",
}, async () => {
  assert.ok(db);
});

test("two customers cannot reserve the final item", {
  skip: safeTestDatabase ? false : "TEST_DATABASE_URL is not configured safely.",
}, async () => {
  const fixture = await createFixture([1], 2);
  try {
    const body = checkoutBody(fixture.storeIds[0], fixture.productIds[0], 1);
    const results = await Promise.allSettled([
      createOrRecoverCheckout(fixture.customerIds[0], body, randomUUID(), db!),
      createOrRecoverCheckout(fixture.customerIds[1], body, randomUUID(), db!),
    ]);

    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected && rejected.status === "rejected" && rejected.reason instanceof CheckoutError);
    const inventory = await db!.inventory.findUnique({ where: { productId: fixture.productIds[0] } });
    assert.equal(inventory?.quantity, 0);
    assert.equal(await db!.order.count({ where: { storeId: fixture.storeIds[0] } }), 1);
  } finally {
    await removeFixture(fixture);
  }
});

test("a multi-store checkout rolls back all reservations when one item is unavailable", {
  skip: safeTestDatabase ? false : "TEST_DATABASE_URL is not configured safely.",
}, async () => {
  const fixture = await createFixture([1, 0], 1);
  try {
    const body = {
      ...checkoutBody(fixture.storeIds[0], fixture.productIds[0], 1),
      items: [
        { id: fixture.productIds[0], storeId: fixture.storeIds[0], quantity: 1 },
        { id: fixture.productIds[1], storeId: fixture.storeIds[1], quantity: 1 },
      ],
    };
    await assert.rejects(
      createOrRecoverCheckout(fixture.customerIds[0], body, randomUUID(), db!),
      CheckoutError,
    );
    const firstInventory = await db!.inventory.findUnique({ where: { productId: fixture.productIds[0] } });
    assert.equal(firstInventory?.quantity, 1);
    assert.equal(await db!.order.count({ where: { customerId: fixture.customerIds[0] } }), 0);
    assert.equal(await db!.checkoutAttempt.count({ where: { customerId: fixture.customerIds[0] } }), 0);
  } finally {
    await removeFixture(fixture);
  }
});

test("simultaneous retries with one idempotency key create one checkout", {
  skip: safeTestDatabase ? false : "TEST_DATABASE_URL is not configured safely.",
}, async () => {
  const fixture = await createFixture([2], 1);
  try {
    const key = randomUUID();
    const body = checkoutBody(fixture.storeIds[0], fixture.productIds[0], 1);
    const [first, second] = await Promise.all([
      createOrRecoverCheckout(fixture.customerIds[0], body, key, db!),
      createOrRecoverCheckout(fixture.customerIds[0], body, key, db!),
    ]);
    assert.equal(first.checkout.checkoutAttemptId, second.checkout.checkoutAttemptId);
    assert.equal(Number(first.created) + Number(second.created), 1);
    assert.equal(await db!.order.count({ where: { customerId: fixture.customerIds[0] } }), 1);
    const inventory = await db!.inventory.findUnique({ where: { productId: fixture.productIds[0] } });
    assert.equal(inventory?.quantity, 1);
  } finally {
    await removeFixture(fixture);
  }
});

test("a checkout completes only after every store order is paid", {
  skip: safeTestDatabase ? false : "TEST_DATABASE_URL is not configured safely.",
}, async () => {
  const fixture = await createFixture([1, 1], 1);
  try {
    const result = await createOrRecoverCheckout(
      fixture.customerIds[0],
      {
        ...checkoutBody(fixture.storeIds[0], fixture.productIds[0], 1),
        items: [
          { id: fixture.productIds[0], storeId: fixture.storeIds[0], quantity: 1 },
          { id: fixture.productIds[1], storeId: fixture.storeIds[1], quantity: 1 },
        ],
      },
      randomUUID(),
      db!,
    );
    const [firstOrder, secondOrder] = result.checkout.orders;
    await db!.$transaction([
      db!.payment.update({ where: { paymentId: firstOrder.payment!.paymentId }, data: { status: "PAID", paidAt: new Date() } }),
      db!.order.update({ where: { orderId: firstOrder.orderId }, data: { paymentStatus: "PAID" } }),
    ]);
    await completeCheckoutAttemptIfPaid(result.checkout.checkoutAttemptId, db!);
    let attempt = await db!.checkoutAttempt.findUnique({ where: { checkoutAttemptId: result.checkout.checkoutAttemptId } });
    assert.equal(attempt?.status, "OPEN");

    await db!.$transaction([
      db!.payment.update({ where: { paymentId: secondOrder.payment!.paymentId }, data: { status: "PAID", paidAt: new Date() } }),
      db!.order.update({ where: { orderId: secondOrder.orderId }, data: { paymentStatus: "PAID" } }),
    ]);
    await Promise.all([
      completeCheckoutAttemptIfPaid(result.checkout.checkoutAttemptId, db!),
      completeCheckoutAttemptIfPaid(result.checkout.checkoutAttemptId, db!),
    ]);
    attempt = await db!.checkoutAttempt.findUnique({ where: { checkoutAttemptId: result.checkout.checkoutAttemptId } });
    assert.equal(attempt?.status, "COMPLETED");
  } finally {
    await removeFixture(fixture);
  }
});

test.after(async () => {
  await db?.$disconnect();
});
