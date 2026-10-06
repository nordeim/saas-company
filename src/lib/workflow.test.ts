import { describe, expect, it } from "vitest";
import {
  WORKFLOW_CATEGORIES,
  isWorkflowStatus,
  sanitizeGeneratedWorkflow,
  templateWorkflow,
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
