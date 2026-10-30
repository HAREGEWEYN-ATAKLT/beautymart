import assert from "node:assert/strict";
import test from "node:test";
import { classifyChapaVerification } from "./chapa-payment-reconciliation";

const reference = "BM-12345678-1234-1234-1234-123456789012";
const response = (status: string) => ({ status: "success", data: { tx_ref: reference, currency: "ETB", amount: "300", status } });

test("Chapa reconciliation accepts only an exact verified success", () => {
  assert.equal(classifyChapaVerification(200, response("success"), reference, 300), "PAID");
  assert.equal(classifyChapaVerification(200, response("failed"), reference, 300), "FAILED");
  assert.equal(classifyChapaVerification(200, response("failed/cancelled"), reference, 300), "FAILED");
  assert.equal(classifyChapaVerification(200, response("cancelled"), reference, 300), "FAILED");
  assert.equal(classifyChapaVerification(200, response("incomplete"), reference, 300), "FAILED");
  assert.equal(classifyChapaVerification(200, response("pending"), reference, 300), "PENDING");
  assert.equal(classifyChapaVerification(200, response("success"), reference, 301), "UNKNOWN");
  assert.equal(classifyChapaVerification(200, response("success"), "other", 300), "UNKNOWN");
});
