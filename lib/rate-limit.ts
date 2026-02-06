import { NextResponse } from "next/server";

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60_000,
  max: 10,
};

const RATE_LIMIT_STORE =
  (globalThis as { __afroxhubRateLimit?: Map<string, RateLimitState> })
    .__afroxhubRateLimit ?? new Map<string, RateLimitState>();

if (
  !(globalThis as { __afroxhubRateLimit?: Map<string, RateLimitState> })
    .__afroxhubRateLimit
) {
  (globalThis as { __afroxhubRateLimit?: Map<string, RateLimitState> })
    .__afroxhubRateLimit = RATE_LIMIT_STORE;
}

function getClientId(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || forwardedFor;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return request.headers.get("user-agent") || "unknown";
}

export function rateLimit(
  request: Request,
  options: Partial<RateLimitOptions> = {},
): RateLimitResult {
  const { windowMs, max } = { ...DEFAULT_OPTIONS, ...options };
  const clientId = getClientId(request);
  const now = Date.now();
  const existing = RATE_LIMIT_STORE.get(clientId);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    RATE_LIMIT_STORE.set(clientId, { count: 1, resetAt });
    return {
      ok: true,
      remaining: max - 1,
      resetAt,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  const nextCount = existing.count + 1;
  existing.count = nextCount;
  RATE_LIMIT_STORE.set(clientId, existing);

  const remaining = Math.max(max - nextCount, 0);
  const retryAfterMs = Math.max(existing.resetAt - now, 0);

  return {
    ok: nextCount <= max,
    remaining,
    resetAt: existing.resetAt,
    retryAfter: Math.ceil(retryAfterMs / 1000),
  };
}

export function withRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
  limit: number,
) {
  response.headers.set("x-ratelimit-limit", String(limit));
  response.headers.set("x-ratelimit-remaining", String(result.remaining));
  response.headers.set("x-ratelimit-reset", String(Math.ceil(result.resetAt / 1000)));
  if (!result.ok) {
    response.headers.set("retry-after", String(result.retryAfter));
  }
  return response;
}
