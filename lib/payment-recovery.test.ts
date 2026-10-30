import assert from "node:assert/strict";
import test from "node:test";
import { isRejectedLegacyChapaReference } from "./payment-recovery";

test("only a rejected overlong legacy Chapa reference may be released for retry", () => {
  assert.equal(isRejectedLegacyChapaReference("x".repeat(51), 400), true);
  assert.equal(isRejectedLegacyChapaReference("x".repeat(50), 400), false);
  assert.equal(isRejectedLegacyChapaReference("x".repeat(51), 404), false);
});
