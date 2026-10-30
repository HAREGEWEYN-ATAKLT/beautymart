import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { clientIp, rateLimitResponse } from "./rate-limit";

test("client IP ignores forwarding headers unless the trusted proxy flag is enabled", () => {
  const previous = process.env.TRUST_PROXY_HEADERS;
  delete process.env.TRUST_PROXY_HEADERS;
  const request = new NextRequest("http://localhost", { headers: { "x-forwarded-for": "203.0.113.5" } });
  assert.equal(clientIp(request), "unavailable");
  process.env.TRUST_PROXY_HEADERS = "true";
  assert.equal(clientIp(request), "203.0.113.5");
  if (previous === undefined) delete process.env.TRUST_PROXY_HEADERS; else process.env.TRUST_PROXY_HEADERS = previous;
});

test("rate limited responses use 429 and retry-after", async () => {
  const response = rateLimitResponse(Date.now() + 2_000);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "2");
});
