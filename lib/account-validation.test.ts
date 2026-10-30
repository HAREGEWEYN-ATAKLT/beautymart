import assert from "node:assert/strict";
import test from "node:test";
import { isValidEmail, isValidFullName, isValidPassword, isValidPhone, normalizeEmail } from "./account-validation";

test("account validation normalizes and validates public registration fields", () => {
  assert.equal(normalizeEmail("  CUSTOMER@Example.com "), "customer@example.com");
  assert.equal(isValidEmail("customer@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidFullName("A"), false);
  assert.equal(isValidFullName("Customer Name"), true);
  assert.equal(isValidPhone("+251 91 234 5678"), true);
  assert.equal(isValidPhone("phone-number"), false);
  assert.equal(isValidPassword("short"), false);
  assert.equal(isValidPassword("x".repeat(129)), false);
  assert.equal(isValidPassword("safe-password"), true);
});
