import assert from "node:assert/strict";
import test from "node:test";
import { validateProductImage } from "./product-image-validation";

test("product images require a supported type and matching file signature", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(validateProductImage({ type: "image/png", size: 8 }, png), null);
  assert.match(validateProductImage({ type: "image/svg+xml", size: 8 }, png) ?? "", /JPEG/);
  assert.match(validateProductImage({ type: "image/png", size: 8 }, new Uint8Array(8)) ?? "", /does not contain/);
});
