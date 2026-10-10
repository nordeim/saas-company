import { describe, expect, it, vi } from "vitest";
import {
  GENERATE_SYSTEM_PROMPT,
  SDK_TIMEOUT_MS,
  WORKFLOW_CATEGORIES,
  isWorkflowStatus,
  parseLlmWorkflow,
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

describe("parseLlmWorkflow (Session 34 — the real-SDK output path)", () => {
  it("passes a bare-JSON LLM response straight through the sanitizer", () => {
    const w = parseLlmWorkflow('{"name":"Lead enrichment","description":"Enriches inbound leads and scores them.","category":"Sales"}');
    expect(w).toEqual({
      name: "Lead enrichment",
      description: "Enriches inbound leads and scores them.",
      category: "Sales",
    });
  });

  it("strips markdown fences — the shape a real chat model actually emits", () => {
    const w = parseLlmWorkflow(
      '```json\n{"name":"Lead enrichment","description":"Enriches inbound leads and scores them.","category":"Sales"}\n```',
    );
    expect(w?.name).toBe("Lead enrichment");
    expect(w?.category).toBe("Sales");
  });

  it("strips a bare fence (no json language tag) too", () => {
    const w = parseLlmWorkflow(
      '```\n{"name":"Lead enrichment","description":"Enriches inbound leads and scores them.","category":"Sales"}\n```',
    );
    expect(w?.name).toBe("Lead enrichment");
  });

  it("returns null for a valid-JSON object that fails sanitization (the template stands, no throw)", () => {
    expect(parseLlmWorkflow("{}")).toBeNull();
    expect(
      parseLlmWorkflow(JSON.stringify({ name: "", description: "long enough description here.", category: "Ops" })),
    ).toBeNull();
  });

  it("THROWS on empty or whitespace-only completions (JSON.parse's own contract, preserved for the route's catch)", () => {
    expect(() => parseLlmWorkflow("")).toThrow();
    expect(() => parseLlmWorkflow("   \n  ")).toThrow();
  });

  it("THROWS on non-JSON text — the route's catch owns that failure class (JSON.parse's contract, preserved)", () => {
    expect(() => parseLlmWorkflow("not json at all")).toThrow();
  });

  it("returns null for valid JSON that is not an object (array/string/number/null)", () => {
    expect(parseLlmWorkflow('["Lead enrichment"]')).toBeNull();
    expect(parseLlmWorkflow('"just a string"')).toBeNull();
    expect(parseLlmWorkflow("42")).toBeNull();
    expect(parseLlmWorkflow("null")).toBeNull();
  });

  it("clamps an over-long LLM shape through the same sanitizer bounds (name 120, description 500)", () => {
    const w = parseLlmWorkflow(
      JSON.stringify({
        name: "L".repeat(300),
        description: "D".repeat(800),
        category: "Support",
      }),
    );
    expect(w?.name.length).toBe(120);
    expect(w?.description.length).toBe(500);
    expect(w?.category).toBe("Support");
  });

  it("falls back to Ops for unknown categories and rejects short descriptions — the sanitizer's contract, unchanged", () => {
    const w = parseLlmWorkflow(
      JSON.stringify({ name: "Valid name", description: "Long enough description here.", category: "Nonsense" }),
    );
    expect(w?.category).toBe("Ops");
    expect(
      parseLlmWorkflow(JSON.stringify({ name: "Valid name", description: "short", category: "Ops" })),
    ).toBeNull();
  });
});

describe("GENERATE_SYSTEM_PROMPT (Session 35 — the SDK-prompt drift guard)", () => {
  it("asks for minified JSON with the name/description/category shape (the route's exact prompt, extracted verbatim)", () => {
    expect(GENERATE_SYSTEM_PROMPT).toBe(
      'You turn one-line automation ideas into workflow definitions. Reply with ONLY minified JSON of shape {"name": string (<= 60 chars), "description": string (one sentence, <= 220 chars), "category": one of "Marketing" | "Sales" | "Engineering" | "Ops" | "Finance" | "Support"}. No prose, no markdown fences.',
    );
  });

  it("the belt-and-braces invariant: the prompt's name limit (60) stays at or under the sanitizer's name clamp (120)", () => {
    const promptNameLimit = Number(GENERATE_SYSTEM_PROMPT.match(/"name": string \(<= (\d+) chars\)/)?.[1] ?? 0);
    expect(promptNameLimit).toBe(60);
    // The clamp itself, measured through the seam (not a second magic number):
    expect(sanitizeGeneratedWorkflow({ name: "x".repeat(200), description: "long enough description", category: "Ops" }, "")?.name.length).toBe(120);
    expect(promptNameLimit).toBeLessThanOrEqual(120);
  });

  it("the belt-and-braces invariant: the prompt's description limit (220) stays at or under the sanitizer's description clamp (500)", () => {
    const promptDescLimit = Number(GENERATE_SYSTEM_PROMPT.match(/"description": string \(one sentence, <= (\d+) chars\)/)?.[1] ?? 0);
    expect(promptDescLimit).toBe(220);
    expect(
      sanitizeGeneratedWorkflow({ name: "Valid name", description: "d".repeat(600), category: "Ops" }, "")?.description.length,
    ).toBe(500);
    expect(promptDescLimit).toBeLessThanOrEqual(500);
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
