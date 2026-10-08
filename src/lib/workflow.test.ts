import { describe, expect, it, vi } from "vitest";
import {
  SDK_TIMEOUT_MS,
  WORKFLOW_CATEGORIES,
  isWorkflowStatus,
  sanitizeGeneratedWorkflow,
  templateWorkflow,
  withTimeout,
} from "./workflow";

describe("templateWorkflow (deterministic fallback)", () => {
  it("capitalizes the idea and fills a description", () => {
    const w = templateWorkflow("sync invoices to quickbooks");
    expect(w.name).toBe("Sync invoices to quickbooks");
    expect(w.description).toContain("sync invoices to quickbooks");
    expect(w.description.length).toBeGreaterThan(20);
  });

  it("maps keywords to categories and defaults to Ops", () => {
    expect(templateWorkflow("marketing digest").category).toBe("Marketing");
    expect(templateWorkflow("sales routing").category).toBe("Sales");
    expect(templateWorkflow("engineering alerts").category).toBe("Engineering");
    expect(templateWorkflow("something else").category).toBe("Ops");
  });

  it("clamps runaway ideas to 120 chars", () => {
    const w = templateWorkflow("x".repeat(300));
    expect(w.name.length).toBeLessThanOrEqual(120);
  });
});

describe("sanitizeGeneratedWorkflow (LLM bounds)", () => {
  it("accepts a well-formed LLM shape", () => {
    const w = sanitizeGeneratedWorkflow(
      { name: "Lead enrichment", description: "Enriches inbound leads and scores them.", category: "Sales" },
      "lead enrichment",
    );
    expect(w).toEqual({
      name: "Lead enrichment",
      description: "Enriches inbound leads and scores them.",
      category: "Sales",
    });
  });

  it("clamps name and description lengths", () => {
    const w = sanitizeGeneratedWorkflow(
      { name: "n".repeat(300), description: "d".repeat(900), category: "Marketing" },
      "idea",
    );
    expect(w!.name.length).toBeLessThanOrEqual(120);
    expect(w!.description.length).toBeLessThanOrEqual(500);
  });

  it("rejects missing name, too-short descriptions, and non-objects", () => {
    expect(sanitizeGeneratedWorkflow({ name: "", description: "long enough description here" }, "i")).toBeNull();
    expect(sanitizeGeneratedWorkflow({ name: "x", description: "short" }, "i")).toBeNull();
    expect(sanitizeGeneratedWorkflow(null, "i")).toBeNull();
    expect(sanitizeGeneratedWorkflow("string", "i")).toBeNull();
  });

  it("falls back to Ops for unknown categories", () => {
    const w = sanitizeGeneratedWorkflow(
      { name: "Ok", description: "A long enough description.", category: "Nonsense" },
      "i",
    );
    expect(w!.category).toBe("Ops");
  });
});

describe("status vocabulary", () => {
  it("accepts the three statuses and rejects everything else", () => {
    for (const s of ["active", "paused", "draft"]) expect(isWorkflowStatus(s)).toBe(true);
    for (const s of ["running", "", null, 42, "ACTIVE"]) expect(isWorkflowStatus(s)).toBe(false);
  });

  it("keeps the category list stable", () => {
    expect(WORKFLOW_CATEGORIES).toHaveLength(6);
  });
});

describe("withTimeout (Session-15 F3: the SDK hang guard)", () => {
  it("passes a fast resolution straight through", async () => {
    const p = withTimeout(Promise.resolve("draft"), SDK_TIMEOUT_MS, () => "template");
    await expect(p).resolves.toBe("draft");
  });

  it("resolves with the fallback when the timer fires first", async () => {
    vi.useFakeTimers();
    try {
      let settle: (v: string) => void = () => {};
      const hung = new Promise<string>((resolve) => {
        settle = resolve;
      });
      const p = withTimeout(hung, 10_000, () => "template");
      const assertion = expect(p).resolves.toBe("template");
      await vi.advanceTimersByTimeAsync(10_001);
      await assertion;
      settle("late"); // the hung promise settling later changes nothing
    } finally {
      vi.useRealTimers();
    }
  });

  it("propagates a rejection (the caller's catch owns the failure class)", async () => {
    const p = withTimeout(Promise.reject(new Error("sdk down")), SDK_TIMEOUT_MS, () => "template");
    await expect(p).rejects.toThrow("sdk down");
  });

  it("clears the timer on settle (no dangling handle)", async () => {
    vi.useFakeTimers();
    try {
      let timerFiredFallback = false;
      const p = withTimeout(Promise.resolve("fast"), 10_000, () => {
        timerFiredFallback = true;
        return "template";
      });
      await p;
      await vi.advanceTimersByTimeAsync(60_000);
      expect(timerFiredFallback).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("exposes a sane SDK ceiling (10s, not minutes)", () => {
    expect(SDK_TIMEOUT_MS).toBeGreaterThan(1_000);
    expect(SDK_TIMEOUT_MS).toBeLessThanOrEqual(30_000);
  });
});
