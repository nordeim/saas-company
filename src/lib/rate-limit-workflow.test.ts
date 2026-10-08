import { describe, expect, it } from "vitest";
import { workflowRateLimit } from "./rate-limit";

/**
 * Session 21 R2 — the creation-frequency ceiling. POST /api/workflows was
 * the ONLY unthrottled mutation in the app (auth, newsletter, demo, and
 * generate all carry limiters): a script minted unbounded rows — one tiny
 * JSON POST each. The limiter follows the generate pattern (Session 16
 * F1): keyed by the authenticated USER, 30 creates / 15 min default,
 * overridable via WORKFLOW_RATE_LIMIT_MAX.
 */
describe("workflowRateLimit (Session-21 R2: the creation ceiling)", () => {
  it("defaults to 30 creates per USER when the env is unset or invalid", () => {
    const prior = process.env.WORKFLOW_RATE_LIMIT_MAX;
    delete process.env.WORKFLOW_RATE_LIMIT_MAX;
    try {
      // a distinct user per run keeps the shared in-memory buckets isolated
      const user = `wfuser-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      for (let i = 0; i < 30; i++) {
        expect(workflowRateLimit(user).allowed).toBe(true);
      }
      const blocked = workflowRateLimit(user);
      expect(blocked.allowed).toBe(false); // the 31st trips
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    } finally {
      if (prior !== undefined) process.env.WORKFLOW_RATE_LIMIT_MAX = prior;
      else delete process.env.WORKFLOW_RATE_LIMIT_MAX;
    }
  });

  it("honors WORKFLOW_RATE_LIMIT_MAX (the smoke server pins 2 for its deterministic trip)", () => {
    const prior = process.env.WORKFLOW_RATE_LIMIT_MAX;
    process.env.WORKFLOW_RATE_LIMIT_MAX = "3";
    try {
      const user = `wfuser-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      for (let i = 0; i < 3; i++) {
        expect(workflowRateLimit(user).allowed).toBe(true);
      }
      expect(workflowRateLimit(user).allowed).toBe(false); // the 4th trips at the override
    } finally {
      if (prior !== undefined) process.env.WORKFLOW_RATE_LIMIT_MAX = prior;
      else delete process.env.WORKFLOW_RATE_LIMIT_MAX;
    }
  });

  it("falls back to 30 on a malformed override (never crashes the guard)", () => {
    const prior = process.env.WORKFLOW_RATE_LIMIT_MAX;
    process.env.WORKFLOW_RATE_LIMIT_MAX = "not-a-number";
    try {
      const user = `wfuser-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      for (let i = 0; i < 30; i++) {
        expect(workflowRateLimit(user).allowed).toBe(true);
      }
      expect(workflowRateLimit(user).allowed).toBe(false); // the 31st still trips
    } finally {
      if (prior !== undefined) process.env.WORKFLOW_RATE_LIMIT_MAX = prior;
      else delete process.env.WORKFLOW_RATE_LIMIT_MAX;
    }
  });
});
