import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { isUniqueConstraintError } from "./db-errors";

/** Session 17 F2 — the register race's P2002 classification seam. */
describe("isUniqueConstraintError (P2002)", () => {
  it("classifies a real PrismaClientKnownRequestError with code P2002", () => {
    const err = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "test",
      meta: { target: ["email"] },
    });
    expect(isUniqueConstraintError(err)).toBe(true);
  });

  it("rejects other known-request codes (P2025 record-not-found)", () => {
    const err = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "test",
    });
    expect(isUniqueConstraintError(err)).toBe(false);
  });

  it("rejects plain Errors", () => {
    expect(isUniqueConstraintError(new Error("boom"))).toBe(false);
    expect(isUniqueConstraintError(new TypeError("x"))).toBe(false);
  });

  it("rejects duck-typed plain objects (a JSON.parse body is not a DB error)", () => {
    expect(isUniqueConstraintError({ code: "P2002", meta: { target: ["email"] } })).toBe(false);
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(false);
  });

  it("rejects null/undefined/non-objects", () => {
    expect(isUniqueConstraintError(null)).toBe(false);
    expect(isUniqueConstraintError(undefined)).toBe(false);
    expect(isUniqueConstraintError("P2002")).toBe(false);
    expect(isUniqueConstraintError(42)).toBe(false);
  });
});
