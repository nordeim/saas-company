import { describe, expect, it } from "vitest";
import { cleanString, isValidEmail, isValidPassword, requiredString } from "./validation";

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
