import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

type Policy = "registration" | "login" | "payment";
type LimitResult = { success: boolean; reset: number };
type Limiter = { limit(identifier: string): Promise<LimitResult> };

const policies: Record<Policy, { requests: number; window: "10 m" | "1 m"; failClosed: boolean }> = {
  registration: { requests: 5, window: "10 m", failClosed: true },
  login: { requests: 10, window: "10 m", failClosed: true },
  payment: { requests: 8, window: "1 m", failClosed: false },
};

function configured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

const limiters: Partial<Record<Policy, Limiter>> = {};
function limiterFor(policy: Policy): Limiter | null {
  if (!configured()) return null;
  if (!limiters[policy]) {
    const config = policies[policy];
    limiters[policy] = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      prefix: `beautymart:${policy}:v1`,
      analytics: true,
      timeout: 1000,
    });
  }
  return limiters[policy]!;
}

export function clientIp(request: NextRequest) {
  // Forwarded headers are trustworthy only when the hosting proxy is explicitly enabled.
  if (process.env.TRUST_PROXY_HEADERS === "true") {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded) return forwarded;
    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
  }
  return "unavailable";
}

export function rateLimitResponse(reset: number) {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { message: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

export async function enforceRateLimit(policy: Policy, identifier: string) {
  const limiter = limiterFor(policy);
  if (!limiter) return { allowed: true, configured: false } as const;
  try {
    const result = await limiter.limit(identifier);
    return result.success
      ? ({ allowed: true, configured: true } as const)
      : ({ allowed: false, configured: true, reset: result.reset } as const);
  } catch {
    // Account abuse limits fail closed. Payment stays available if Redis is temporarily unavailable.
    return policies[policy].failClosed
      ? ({ allowed: false, configured: true, unavailable: true } as const)
      : ({ allowed: true, configured: true, unavailable: true } as const);
  }
}
