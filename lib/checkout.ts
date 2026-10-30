import { prisma } from "./prisma";
import { PrismaClient } from "../app/generated/prisma/client";

const MAX_IDEMPOTENCY_KEY_LENGTH = 128;

type CartLine = { id?: unknown; storeId?: unknown; quantity?: unknown };

export class CheckoutError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export function parseCheckoutInput(body: unknown, idempotencyKey: string) {
  if (!idempotencyKey || idempotencyKey.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    throw new CheckoutError("A valid Idempotency-Key header is required to create an order.");
  }

  if (!body || typeof body !== "object") throw new CheckoutError("Invalid checkout request.");
  const input = body as Record<string, unknown>;
  if (!Array.isArray(input.items) || input.items.length === 0) throw new CheckoutError("Your cart is empty.");
  if (input.paymentMethod !== "Chapa") {
    throw new CheckoutError(
      "Only Chapa checkout is available right now. Telebirr and bank payments are not enabled until their merchant verification integrations are configured."
    );
  }

  const region = typeof input.region === "string" ? input.region.trim() : "";
  const city = typeof input.city === "string" ? input.city.trim() : "";
  if (!region || !city) throw new CheckoutError("Region and city are required.");

  const seen = new Set<string>();
  const items = input.items.map((item: CartLine) => {
    const productId = typeof item.id === "string" ? item.id.trim() : "";
    const storeId = typeof item.storeId === "string" ? item.storeId.trim() : "";
    const quantity = Number(item.quantity);
    if (!productId || !storeId || !Number.isInteger(quantity) || quantity < 1) {
      throw new CheckoutError("Each cart item must contain a product, store, and positive whole quantity.");
    }
    if (seen.has(productId)) throw new CheckoutError("A product may appear only once in a checkout.");
    seen.add(productId);
    return { productId, storeId, quantity };
  });

  return {
    idempotencyKey,
    items,
    region,
    city,
    subCity: typeof input.subCity === "string" ? input.subCity.trim() || null : null,
    woreda: typeof input.woreda === "string" ? input.woreda.trim() || null : null,
    houseNumber: typeof input.houseNumber === "string" ? input.houseNumber.trim() || null : null,
  };
}

type CheckoutAttemptRecord = NonNullable<
  Awaited<ReturnType<typeof findAttempt>>
>;

function serializeAttempt(attempt: CheckoutAttemptRecord) {
  return {
    checkoutAttemptId: attempt.checkoutAttemptId,
    status: attempt.status,
    orders: attempt.orders.map((order) => ({
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      storeId: order.storeId,
      finalAmount: String(order.finalAmount),
      paymentStatus: order.paymentStatus,
      payment: order.payments[0]
        ? {
            paymentId: order.payments[0].paymentId,
            provider: order.payments[0].provider,
            status: order.payments[0].status,
            transactionReference: order.payments[0].transactionReference,
          }
        : null,
    })),
  };
}

async function findAttempt(db: PrismaClient, customerId: string, idempotencyKey: string) {
  return db.checkoutAttempt.findUnique({
    where: { customerId_idempotencyKey: { customerId, idempotencyKey } },
    include: { orders: { include: { payments: true }, orderBy: { createdAt: "asc" } } },
  });
}

export async function createOrRecoverCheckout(
  customerId: string,
  body: unknown,
  idempotencyKey: string,
  db: PrismaClient = prisma
) {
  const input = parseCheckoutInput(body, idempotencyKey);
  const existing = await findAttempt(db, customerId, input.idempotencyKey);
  if (existing) return { created: false, checkout: serializeAttempt(existing) };

  const linesByStore = new Map<string, typeof input.items>();
  for (const line of input.items) {
    const lines = linesByStore.get(line.storeId) ?? [];
    lines.push(line);
    linesByStore.set(line.storeId, lines);
  }

  try {
    const attempt = await db.$transaction(async (tx) => {
      const checkoutAttempt = await tx.checkoutAttempt.create({
        data: { customerId, idempotencyKey: input.idempotencyKey, status: "OPEN" },
      });
      const address = await tx.address.create({
        data: { customerId, region: input.region, city: input.city, subCity: input.subCity, woreda: input.woreda, houseNumber: input.houseNumber },
      });
      const orders = [];
      const now = new Date();

      for (const [storeId, storeLines] of linesByStore) {
        const store = await tx.store.findFirst({
          where: {
            storeId,
            status: "ACTIVE",
            subscription: { is: { status: "ACTIVE", isActive: true, endDate: { gt: now } } },
          },
          select: { storeId: true },
        });
        if (!store) throw new CheckoutError("One of the stores in your cart is unavailable.", 403);

        const products = await tx.product.findMany({
          where: { productId: { in: storeLines.map((line) => line.productId) }, storeId, isActive: true },
          include: { inventory: true, productDiscounts: { include: { discount: true } } },
        });
        if (products.length !== storeLines.length) {
          throw new CheckoutError("A product is unavailable or belongs to a different store.");
        }

        const pricedLines = storeLines.map((line) => {
          const product = products.find((candidate) => candidate.productId === line.productId);
          if (!product?.inventory) throw new CheckoutError("A product does not have inventory configured.");
          const discount = product.productDiscounts.find(({ discount }) =>
            discount.isActive && discount.startDate <= now && discount.endDate >= now
          )?.discount;
          const price = Number(product.price);
          const rawDiscount = !discount ? 0 : discount.discountType === "PERCENTAGE"
            ? (price * Number(discount.discountValue)) / 100
            : Number(discount.discountValue);
          const discountPerUnit = Math.min(Math.max(rawDiscount, 0), price);
          return { product, quantity: line.quantity, unitPrice: price - discountPerUnit, discountPerUnit };
        });

        for (const line of pricedLines) {
          // This is the actual reservation. PostgreSQL performs the quantity
          // check and decrement together, so concurrent buyers cannot oversell.
          const reserved = await tx.inventory.updateMany({
            where: { productId: line.product.productId, quantity: { gte: line.quantity } },
            data: { quantity: { decrement: line.quantity } },
          });
          if (reserved.count !== 1) throw new CheckoutError(`Not enough stock for ${line.product.productName}.`);
        }

        const totalAmount = pricedLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
        const discountAmount = pricedLines.reduce((sum, line) => sum + line.discountPerUnit * line.quantity, 0);
        orders.push(await tx.order.create({
          data: {
            checkoutAttemptId: checkoutAttempt.checkoutAttemptId,
            storeId,
            customerId,
            addressId: address.addressId,
            orderNumber: `BM-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
            totalAmount,
            discountAmount,
            finalAmount: totalAmount,
            paymentStatus: "PENDING",
            orderStatus: "PENDING",
            items: { create: pricedLines.map((line) => ({
              productId: line.product.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              discountAmount: line.discountPerUnit * line.quantity,
              totalPrice: line.unitPrice * line.quantity,
            })) },
            payments: { create: { storeId, provider: "CHAPA", amount: totalAmount, status: "PENDING" } },
          },
          include: { payments: true },
        }));
      }
      return { ...checkoutAttempt, orders };
    });
    return { created: true, checkout: serializeAttempt(attempt) };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      const recovered = await findAttempt(db, customerId, input.idempotencyKey);
      if (recovered) return { created: false, checkout: serializeAttempt(recovered) };
    }
    throw error;
  }
}

export async function completeCheckoutAttemptIfPaid(
  checkoutAttemptId: string,
  db: PrismaClient = prisma
) {
  const unpaidOrder = await db.order.findFirst({
    where: { checkoutAttemptId, paymentStatus: { not: "PAID" } },
    select: { orderId: true },
  });
  if (!unpaidOrder) {
    await db.checkoutAttempt.updateMany({
      where: { checkoutAttemptId, status: "OPEN" },
      data: { status: "COMPLETED" },
    });
  }
}
