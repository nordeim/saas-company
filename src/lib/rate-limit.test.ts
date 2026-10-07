import { describe, expect, it } from "vitest";
import { authRateLimit, checkRate, clientIpOf, type RateBuckets } from "./rate-limit";

function freshBuckets(): RateBuckets {
  return new Map();
}

describe("checkRate (fixed window)", () => {
  it("allows up to the limit and blocks the next attempt", () => {
    const buckets = freshBuckets();
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) {
      expect(checkRate(buckets, "ip", 3, 60_000, t0).allowed).toBe(true);
    }
    const blocked = checkRate(buckets, "ip", 3, 60_000, t0);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const buckets = freshBuckets();
    const t0 = 0;
    expect(checkRate(buckets, "a", 1, 60_000, t0).allowed).toBe(true);
    expect(checkRate(buckets, "a", 1, 60_000, t0).allowed).toBe(false);
    expect(checkRate(buckets, "b", 1, 60_000, t0).allowed).toBe(true);
  });

  it("resets after the window elapses", () => {
    const buckets = freshBuckets();
    const windowMs = 60_000;
    expect(checkRate(buckets, "ip", 1, windowMs, 0).allowed).toBe(true);
    expect(checkRate(buckets, "ip", 1, windowMs, 10_000).allowed).toBe(false);
    expect(checkRate(buckets, "ip", 1, windowMs, 60_001).allowed).toBe(true);
  });

  it("evicts expired entries opportunistically", () => {
    const buckets = freshBuckets();
    checkRate(buckets, "old", 1, 1_000, 0);
    checkRate(buckets, "new", 1, 1_000, 5_000);
    expect(buckets.has("old")).toBe(false);
    expect(buckets.has("new")).toBe(true);
  });

  it("reports remaining budget", () => {
    const buckets = freshBuckets();
    const first = checkRate(buckets, "ip", 3, 60_000, 0);
    expect(first.remaining).toBe(2);
    const second = checkRate(buckets, "ip", 3, 60_000, 1);
    expect(second.remaining).toBe(1);
  });

  it("computes retry-after from the window reset", () => {
    const buckets = freshBuckets();
    checkRate(buckets, "ip", 1, 30_000, 0);
    const blocked = checkRate(buckets, "ip", 1, 30_000, 10_000);
    expect(blocked.retryAfterSec).toBe(20);
  });
});

describe("clientIpOf", () => {
  it("prefers the first x-forwarded-for hop", () => {
    expect(clientIpOf(new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip then unknown", () => {
    expect(clientIpOf(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(clientIpOf(new Headers())).toBe("unknown");
  });
});

describe("authRateLimit (Session-11: the AUTH_RATE_LIMIT_MAX override)", () => {
  it("defaults to 10 attempts per IP when the env is unset or invalid", () => {
    const prior = process.env.AUTH_RATE_LIMIT_MAX;
    delete process.env.AUTH_RATE_LIMIT_MAX;
    try {
      // a distinct IP per run keeps the shared in-memory buckets isolated
      const ip = `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
      for (let i = 0; i < 10; i++) {
        expect(authRateLimit(ip).allowed).toBe(true);
      }
      expect(authRateLimit(ip).allowed).toBe(false); // the 11th trips
    } finally {
      if (prior !== undefined) process.env.AUTH_RATE_LIMIT_MAX = prior;
    }
  });

  it("honors AUTH_RATE_LIMIT_MAX (the e2e webServer's 50)", () => {
    const prior = process.env.AUTH_RATE_LIMIT_MAX;
    process.env.AUTH_RATE_LIMIT_MAX = "3";
    try {
      const ip = `10.1.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
      for (let i = 0; i < 3; i++) {
        expect(authRateLimit(ip).allowed).toBe(true);
      }
      expect(authRateLimit(ip).allowed).toBe(false); // the 4th trips at the override
    } finally {
      if (prior !== undefined) process.env.AUTH_RATE_LIMIT_MAX = prior;
      else delete process.env.AUTH_RATE_LIMIT_MAX;
    }
  });
});
