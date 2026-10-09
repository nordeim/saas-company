import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import net from "node:net";

// The client-fetch contract (Session 24 R1): every CLIENT fetch carries a
// timeout — a black-holed request (a stalled connection: the CLIENT twin
// of Session 15's server-side hang, D78) must convert into a REJECTION
// that the existing catch contracts already handle (the Session-12
// network-fault class: banner + busy release). Pre-fix, no client fetch
// carried a timeout: the dashboard's busyId stayed engaged forever and
// the login card's busy state never released — probed RED (spinner still
// engaged after 8s, no banner).
//
// The seam: fetchWithTimeout(input, init?, timeoutMs = CLIENT_FETCH_TIMEOUT_MS)
// — an AbortController + setTimeout wrapper. The timer is cleared in
// finally (a resolved call never aborts its signal — no leak).

describe("fetchWithTimeout", () => {
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = realFetch;
  });

  it("passes the response through when the fetch resolves within the timeout — and never aborts its signal afterwards", async () => {
    const { fetchWithTimeout, CLIENT_FETCH_TIMEOUT_MS } = await import("@/lib/client-fetch");
    expect(CLIENT_FETCH_TIMEOUT_MS).toBe(20_000);

    let capturedSignal: AbortSignal | null | undefined;
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedSignal = init?.signal ?? null;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch;

    const res = await fetchWithTimeout("/api/workflows");
    expect(res.status).toBe(200);

    // The timer was cleared in finally: advancing FAR past the timeout
    // must NOT abort the (already-settled) call's signal.
    await vi.advanceTimersByTimeAsync(CLIENT_FETCH_TIMEOUT_MS * 2);
    expect(capturedSignal?.aborted).toBe(false);
  });

  it("rejects when the connection never answers — a REAL hung socket converts to the network-fault rejection", async () => {
    const { fetchWithTimeout } = await import("@/lib/client-fetch");

    // A REAL hang, not a mock: a TCP server that accepts the connection
    // and never answers (the stalled-connection class). Node's fetch
    // honors the abort signal — the mock-based variant of this pin
    // couldn't observe the rejection (an inert mock ignores the signal).
    const server = net.createServer(() => {});
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = (server.address() as net.AddressInfo).port;

    try {
      const outcome = fetchWithTimeout(`http://127.0.0.1:${port}/hang`).then(
        () => "resolved",
        (e: unknown) => `rejected:${e instanceof Error ? e.name : String(e)}`,
      );
      await vi.advanceTimersByTimeAsync(20_000);

      // The pre-fix code had NO timeout at all — this pin is the RED line:
      // the hang MUST become a rejection the existing catches can handle.
      expect(await outcome).toMatch(/^rejected:/);
    } finally {
      server.close();
    }
  }, 15_000);

  it("aborts the UNDERLYING fetch when the timeout fires (the connection is actually torn down)", async () => {
    const { fetchWithTimeout } = await import("@/lib/client-fetch");

    let capturedSignal: AbortSignal | null | undefined;
    globalThis.fetch = ( (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedSignal = init?.signal ?? null;
      // Simulate the real engine: honors the abort signal by rejecting.
      return new Promise<Response>((_resolve, reject) => {
        capturedSignal?.addEventListener("abort", () => {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    }) as typeof fetch;

    const outcome = fetchWithTimeout("/api/auth/login", { method: "POST" }).then(
      () => "resolved",
      (e: unknown) => `rejected:${e instanceof Error ? e.name : String(e)}`,
    );
    await vi.advanceTimersByTimeAsync(20_000);

    expect(capturedSignal?.aborted).toBe(true);
    expect(await outcome).toBe("rejected:AbortError");
  });
});
