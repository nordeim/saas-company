import { describe, expect, it } from "vitest";
import {
  cleanString,
  isValidEmail,
  isValidPassword,
  requiredString,
  safeRedirectPath,
} from "./validation";

describe("isValidEmail", () => {
  it.each(["a@b.co", "user.name+tag@example.co.uk", "  spaced@example.com  "])(
    "accepts %s",
    (value) => {
      expect(isValidEmail(value)).toBe(true);
    },
  );

  it.each(["nope", "a@b", "a b@c.com", "", null, undefined, 42, "a".repeat(250) + "@x.io"])(
    "rejects %s",
    (value) => {
      expect(isValidEmail(value)).toBe(false);
    },
  );
});

describe("isValidPassword", () => {
  it("requires 8–128 characters", () => {
    expect(isValidPassword("short")).toBe(false);
    expect(isValidPassword("7 chars")).toBe(false);
    expect(isValidPassword("8 chars!")).toBe(true);
    expect(isValidPassword("x".repeat(129))).toBe(false);
    expect(isValidPassword(null)).toBe(false);
  });
});

describe("cleanString", () => {
  it("trims and clamps", () => {
    expect(cleanString("  hello  ", 20)).toBe("hello");
    expect(cleanString("abcdef", 3)).toBe("abc");
  });

  it("returns null for empty or non-string input", () => {
    expect(cleanString("   ", 10)).toBeNull();
    expect(cleanString(123, 10)).toBeNull();
    expect(cleanString(null, 10)).toBeNull();
  });
});

describe("requiredString", () => {
  it("accepts bounded non-empty strings", () => {
    expect(requiredString("Workflow", 20, "Name")).toEqual({ ok: true, value: "Workflow" });
  });

  it("rejects missing, empty, and over-length values", () => {
    expect(requiredString("", 10, "Name").ok).toBe(false);
    expect(requiredString(undefined, 10, "Name").ok).toBe(false);
    expect(requiredString("x".repeat(11), 10, "Name").ok).toBe(false);
  });

  it("carries the field name in the error", () => {
    const result = requiredString("", 10, "Name");
    if (!result.ok) expect(result.error).toContain("Name");
  });
});

describe("safeRedirectPath (Session-15 F1: the from_url open-redirect guard)", () => {
  it("falls back to /dashboard for missing and non-string values", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath(undefined)).toBe("/dashboard");
    expect(safeRedirectPath(123)).toBe("/dashboard");
  });

  it("falls back for empty and whitespace-only values", () => {
    expect(safeRedirectPath("")).toBe("/dashboard");
    expect(safeRedirectPath("   ")).toBe("/dashboard");
  });

  it("keeps internal absolute paths, with query and hash", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/faq")).toBe("/faq");
    expect(safeRedirectPath("/faq?x=1#z")).toBe("/faq?x=1#z");
  });

  it("trims padding before judging (browsers ignore leading whitespace)", () => {
    expect(safeRedirectPath("  /dashboard  ")).toBe("/dashboard");
  });

  it.each([
    "https://evil.example/phish",
    "http://evil.example",
    "//evil.example/phish",
    "/\\evil.example/phish",
    "javascript:alert(1)",
    "data:text/html,hello",
    "mailto:someone@example.com",
  ])("rejects the external/absolute vector %s", (value) => {
    expect(safeRedirectPath(value)).toBe("/dashboard");
  });

  it("rejects a relative-path value (no leading slash)", () => {
    expect(safeRedirectPath("dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("faq?x=1")).toBe("/dashboard");
  });
});
