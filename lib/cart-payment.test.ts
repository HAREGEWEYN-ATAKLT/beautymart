import assert from "node:assert/strict";
import test from "node:test";
import { subtractPaidOrderItems } from "./cart-payment";

test("paid order quantities leave later-added cart quantities intact", () => {
  const result = subtractPaidOrderItems(
    [
      { id: "paid-product", quantity: 3 },
      { id: "later-product", quantity: 2 },
    ],
    [{ id: "paid-product", quantity: 1 }],
  );

  assert.deepEqual(result, [
    { id: "paid-product", quantity: 2 },
    { id: "later-product", quantity: 2 },
  ]);
});
