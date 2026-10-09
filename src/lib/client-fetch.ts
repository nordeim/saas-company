// ---------------------------------------------------------------------------
// The client fetch timeout (Session 24 R1) — the CLIENT twin of Session
// 15's server-side hang seam (withTimeout / D78).
//
// Contract: every CLIENT fetch carries a timeout. A black-holed request
// (a stalled connection — one that neither resolves nor rejects) must
// convert into a REJECTION that the existing catch contracts already
// handle (the Session-12 network-fault class: the visible banner + the
// busy-state release). Pre-fix, no client fetch carried a timeout — the
// dashboard's busyId stayed engaged forever (the row's buttons spinning
// eternally) and the login card's busy state never released — probed RED
// with a never-fulfilling route: the spinner was still engaged after 8
// seconds and no banner rendered.
//
// 20s exceeds every legitimate client flow: the server's own SDK timeout
// is 10s (SDK_TIMEOUT_MS, D78 — the generate route degrades to the
// template at that ceiling), and every other route is sub-second. The
// timer is cleared in finally — a settled call never aborts its signal.
// ---------------------------------------------------------------------------

/** The client-side ceiling: generous against every legitimate flow,
 * ruthless against a hang. A code constant (not env) — it guards the
 * BROWSER's connection, not a deployment knob. */
export const CLIENT_FETCH_TIMEOUT_MS = 20_000;

/**
 * fetch(), but a request that never settles rejects at the ceiling —
 * the hang class folds into the existing network-fault catches. The
 * abort rejection propagates as-is (an AbortError DOMException in
 * browsers); callers' catch blocks already treat any rejection as the
 * retryable class.
 */
export async function fetchWithTimeout(
  input: string | URL | Request,
  init?: RequestInit,
  timeoutMs: number = CLIENT_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
