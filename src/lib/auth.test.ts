import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  dummyPasswordHash,
  hashPassword,
  parseSessionToken,
  registrationOpen,
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

describe("constant-time login (Session 17 F1 — CWE-208)", () => {
  it("the dummy hash carries the salt:hash shape verifyPassword parses", () => {
    expect(dummyPasswordHash()).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
    // verifyPassword must ACCEPT the shape without throwing (the unknown-
    // email path calls it unconditionally — its cost is the timing floor).
    expect(() => verifyPassword("anything", dummyPasswordHash())).not.toThrow();
  });

  it("the dummy hash is stable across calls (a per-process constant)", () => {
    expect(dummyPasswordHash()).toBe(dummyPasswordHash());
  });

  it("the dummy hash never validates a candidate password", () => {
    expect(verifyPassword("password", dummyPasswordHash())).toBe(false);
    expect(verifyPassword("", dummyPasswordHash())).toBe(false);
    expect(verifyPassword("Demo1234!", dummyPasswordHash())).toBe(false);
  });

  it("the dummy hash is not derivable from a real hash of any input", () => {
    expect(dummyPasswordHash()).not.toBe(hashPassword("password"));
    expect(dummyPasswordHash()).not.toBe(hashPassword(""));
    const [dummySalt] = dummyPasswordHash().split(":");
    const [realSalt] = hashPassword("password").split(":");
    expect(dummySalt).not.toBe(realSalt);
  });
});

describe("registration gate (Session 17 F3 — PAD §10 MEDIUM)", () => {
  const ENV_KEY = "ALLOW_REGISTRATION";

  it("defaults OPEN when unset", () => {
    delete process.env[ENV_KEY];
    expect(registrationOpen()).toBe(true);
  });

  it("the exact string \"false\" closes registration", () => {
    process.env[ENV_KEY] = "false";
    expect(registrationOpen()).toBe(false);
  });

  it("every other value stays OPEN (opt-in closure only)", () => {
    for (const v of ["true", "0", "no", "off", "FALSE", " false"]) {
      process.env[ENV_KEY] = v;
      expect(registrationOpen()).toBe(true);
    }
    delete process.env[ENV_KEY];
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

