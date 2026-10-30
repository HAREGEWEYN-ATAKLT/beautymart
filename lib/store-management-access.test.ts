import assert from "node:assert/strict";
import test from "node:test";
import { getStoreManagementBlockReason } from "./store-management-access";

function activeStore() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 1);
  return { status: "ACTIVE", subscription: { status: "ACTIVE", isActive: true, endDate } };
}

test("store management requires both an active store and an active subscription", () => {
  assert.equal(getStoreManagementBlockReason(activeStore()), null);
  assert.match(
    getStoreManagementBlockReason({ ...activeStore(), status: "SUSPENDED" }) ?? "",
    /suspended/i
  );
  assert.match(
    getStoreManagementBlockReason({ ...activeStore(), subscription: null }) ?? "",
    /no subscription/i
  );
});
