import { describe, expect, it, vi } from "vitest";
import { authSecretWarningMessage, register } from "./instrumentation";

/**
 * Session 18 F2 — the loud AUTH_SECRET fallback warning.
 *
 * The warning lives in the instrumentation boot hook and writes to file
 * descriptor 2 DIRECTLY (`fs.writeSync`): the Next.js 16 production
 * runtime captures BOTH `console.*` AND `process.stderr.write` from
 * bundled code (both observed empirically — a module-init console.error
 * and a hook-time process.stderr.write executed without a single log
 * line). These pins hold the message contract and the hook's behavioral
 * contracts. `node:fs` is partially mocked (writeSync only) because the
 * ESM namespace of a builtin cannot be spied directly.
 */
vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, writeSync: vi.fn(() => 0) };
});

describe("AUTH_SECRET boot warning (Session 18 F2 — instrumentation)", () => {
  // Resolved lazily inside the async helpers — `await import` is not
  // allowed in a synchronous describe callback.
  const run = async (env: Record<string, string | undefined>) => {
    const fsModule = await import("node:fs");
    const writeSyncMock = vi.mocked(fsModule.writeSync);
    const originals: Record<string, string | undefined> = {};
    const keys = ["NEXT_RUNTIME", "NODE_ENV", "AUTH_SECRET"];
    for (const k of keys) originals[k] = process.env[k];
    writeSyncMock.mockClear();
    try {
      for (const [k, v] of Object.entries(env)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
      await register();
    } finally {
      for (const k of keys) {
        if (originals[k] === undefined) delete process.env[k];
        else process.env[k] = originals[k];
      }
    }
    return writeSyncMock.mock.calls.map((c) => [...c]);
  };

  it("the message names the var, the consequence, and the remedy", () => {
    const msg = authSecretWarningMessage();
    expect(msg).toContain("AUTH_SECRET");
    expect(msg).toContain("FORGEABLE");
    expect(msg).toContain("openssl rand -hex 32");
    expect(msg.endsWith("\n")).toBe(true);
  });

  it("writes the warning to fd 2 once in a production nodejs boot with AUTH_SECRET unset", async () => {
    const calls = await run({ NEXT_RUNTIME: "nodejs", NODE_ENV: "production", AUTH_SECRET: undefined });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[0]).toBe(2); // the raw stderr file descriptor
    expect(String(calls[0]?.[1])).toContain("FORGEABLE");
  });

  it("fires in the STANDALONE boot reality: NEXT_RUNTIME is unset entirely", async () => {
    // The equality-guard trap: only the EXPLICIT edge value may skip —
    // any other/unset runtime is a node boot and must warn.
    const calls = await run({ NEXT_RUNTIME: undefined, NODE_ENV: "production", AUTH_SECRET: undefined });
    expect(calls).toHaveLength(1);
  });

  it("stays silent in production when AUTH_SECRET is set", async () => {
    const calls = await run({ NEXT_RUNTIME: "nodejs", NODE_ENV: "production", AUTH_SECRET: "a-real-secret" });
    expect(calls).toHaveLength(0);
  });

  it("stays silent outside production (dev/test keep the quiet fallback)", async () => {
    const calls = await run({ NEXT_RUNTIME: "nodejs", NODE_ENV: "test", AUTH_SECRET: undefined });
    expect(calls).toHaveLength(0);
  });

  it("stays silent on the edge runtime (the only legitimate skip)", async () => {
    const calls = await run({ NEXT_RUNTIME: "edge", NODE_ENV: "production", AUTH_SECRET: undefined });
    expect(calls).toHaveLength(0);
  });
});
