import assert from "node:assert/strict";
import test from "node:test";
import { isFinalUnsuccessfulChapaStatus } from "./chapa-status";

test("only known final Chapa failure states allow a payment retry", () => {
  assert.equal(isFinalUnsuccessfulChapaStatus("failed"), true);
  assert.equal(isFinalUnsuccessfulChapaStatus("failed/cancelled"), true);
  assert.equal(isFinalUnsuccessfulChapaStatus("CANCELLED"), true);
  assert.equal(isFinalUnsuccessfulChapaStatus("incomplete"), true);
  assert.equal(isFinalUnsuccessfulChapaStatus("blocked"), true);
  assert.equal(isFinalUnsuccessfulChapaStatus("pending"), false);
  assert.equal(isFinalUnsuccessfulChapaStatus("success"), false);
  assert.equal(isFinalUnsuccessfulChapaStatus("unknown-provider-word"), false);
});
