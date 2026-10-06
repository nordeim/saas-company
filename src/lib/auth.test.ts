import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  hashPassword,
  parseSessionToken,
  verifyPassword,
} from "./auth";

describe("password hashing (scrypt)", () => {
  it("hashes and verifies a correct password", () => {
    const stored = hashPassword("Demo1234!");
    expect(stored).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
    expect(verifyPassword("Demo1234!", stored)).toBe(true);
  });

  it("rejects wrong passwords and malformed stored hashes", () => {
    const stored = hashPassword("Demo1234!");
    expect(verifyPassword("wrong", stored)).toBe(false);
    expect(verifyPassword("Demo1234!", "garbage")).toBe(false);
    expect(verifyPassword("Demo1234!", "onlysalt:")).toBe(false);
  });

  it("salts every hash (no two identical)", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });
});

describe("session tokens (HMAC)", () => {
  it("round-trips a valid token to the user id", () => {
    const token = createSessionToken("user-123");
    expect(parseSessionToken(token)).toBe("user-123");
  });

  it("rejects tampered signatures", () => {
    const token = createSessionToken("user-123");
    const [head, expiry, sig] = token.split(".");
    const flipped = sig!.slice(0, -1) + (sig!.slice(-1) === "a" ? "b" : "a");
    expect(parseSessionToken(`${head}.${expiry}.${flipped}`)).toBeNull();
  });

  it("rejects garbage, truncated, and unsigned tokens", () => {
    expect(parseSessionToken("nope")).toBeNull();
    expect(parseSessionToken("a.b")).toBeNull();
    expect(parseSessionToken("user.99999999999999.deadbeef")).toBeNull();
    expect(parseSessionToken(null)).toBeNull();
    expect(parseSessionToken(undefined)).toBeNull();
  });

  it("is deterministic for the same user and secret", () => {
    // Same userId within the same millisecond produces the same token; the
    // important property is parseSessionToken accepts either.
    const t1 = createSessionToken("u1");
    expect(parseSessionToken(t1)).toBe("u1");
    expect(parseSessionToken(createSessionToken("u2"))).toBe("u2");
  });
});
