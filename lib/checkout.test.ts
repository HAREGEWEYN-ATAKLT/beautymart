import assert from "node:assert/strict";
import test from "node:test";
import { CheckoutError, parseCheckoutInput } from "./checkout";

const validBody = {
  paymentMethod: "Chapa",
  region: "Addis Ababa",
  city: "Addis Ababa",
  items: [{ id: "product-1", storeId: "store-1", quantity: 2 }],
};

test("checkout input accepts only a valid Chapa cart", () => {
  const parsed = parseCheckoutInput(validBody, "checkout-key-1");
  assert.equal(parsed.items[0].quantity, 2);
  assert.equal(parsed.region, "Addis Ababa");
});

test("checkout rejects unsupported payment methods before creating orders", () => {
  assert.throws(
    () => parseCheckoutInput({ ...validBody, paymentMethod: "Telebirr" }, "checkout-key-2"),
    CheckoutError
  );
});

test("checkout rejects duplicate products and invalid quantities", () => {
  assert.throws(
    () => parseCheckoutInput({
      ...validBody,
      items: [
        { id: "product-1", storeId: "store-1", quantity: 1 },
        { id: "product-1", storeId: "store-1", quantity: 1 },
      ],
    }, "checkout-key-3"),
    CheckoutError
  );
  assert.throws(
    () => parseCheckoutInput({
      ...validBody,
      items: [{ id: "product-1", storeId: "store-1", quantity: 0 }],
    }, "checkout-key-4"),
    CheckoutError
  );
});

test("checkout requires a bounded idempotency key", () => {
  assert.throws(() => parseCheckoutInput(validBody, ""), CheckoutError);
  assert.throws(() => parseCheckoutInput(validBody, "x".repeat(129)), CheckoutError);
});
