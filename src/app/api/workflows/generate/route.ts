import { ok, fail, apiRoute, methodGuard, optionsGuard, bodyTooLarge } from "@/lib/api";
import { requireSession } from "@/lib/api";
import { generateRateLimit } from "@/lib/rate-limit";
import { requiredString } from "@/lib/validation";
import {
  SDK_TIMEOUT_MS,
  parseLlmWorkflow,
  templateWorkflow,
  withTimeout,
} from "@/lib/workflow";

/** Session 20 F1: the method-mismatch layer answers the envelope too. */
export const GET = methodGuard("OPTIONS, POST");
export const HEAD = methodGuard("OPTIONS, POST");
export const PUT = methodGuard("OPTIONS, POST");
export const PATCH = methodGuard("OPTIONS, POST");
export const DELETE = methodGuard("OPTIONS, POST");
export const OPTIONS = optionsGuard("OPTIONS, POST");

/**
 * POST /api/workflows/generate — the AI workflow composer (superset).
 *
 * Degrade-not-fail: asks the LLM to turn a one-line idea into a workflow
 * (name/description/category); any SDK failure, malformed output, or
 * short-notice environment falls back to the deterministic template so the
 * feature never hard-fails. Output is clamped by sanitizeGeneratedWorkflow.
 *
 * Session 16 F1: the endpoint carries its own abuse ceiling — the most
 * expensive endpoint per call was the only unlimited one. The per-USER
 * limiter (10/15min, GENERATE_RATE_LIMIT_MAX) runs AFTER the session guard
 * and BEFORE the body parse (the auth routes' own ordering — any attempt
 * counts, valid or not). A 429 keeps the S15 contract (Retry-After); the
 * CLIENT degrades to its template draft (compose()'s genRes.ok check), so
 * the feature still never hard-fails — the limiter only caps the LLM spend.
 */
export async function POST(request: Request) {
  // Session 19 F1: the crash-path envelope (the SDK's own degrade path
  // still fires first — this only formats what escapes).
  return apiRoute(async () => {
  const guard = await requireSession();
  if (!guard.user) return guard.response;

  const limit = generateRateLimit(guard.user.id);
  if (!limit.allowed) {
    return fail(
      "RATE_LIMITED",
      `Too many generations. Try again in ${limit.retryAfterSec}s.`,
      429,
      { "Retry-After": String(limit.retryAfterSec) },
    );
  }

  let body: unknown;
  // Session 20 F2: the request-size ceiling — read the DECLARED size
  // before any buffering (probed: a 50MB body was fully parsed pre-fix).
  const oversized = bodyTooLarge(request);
  if (oversized) return oversized;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Expected a JSON body.", 400);
  }
  const idea = requiredString((body as Record<string, unknown>)?.idea, 200, "Idea");
  if (!idea.ok) return fail("VALIDATION", idea.error, 400);

  let generated = templateWorkflow(idea.value);

  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    // Session-15 F3: the SDK call gains a hang ceiling — a black-holed
    // connection resolves with null after SDK_TIMEOUT_MS and flows into
    // the "" → parse-throw → catch → template path below (the route's
    // structure is unchanged; only the await gains a timeout).
    const completion = await withTimeout(
      zai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              'You turn one-line automation ideas into workflow definitions. Reply with ONLY minified JSON of shape {"name": string (<= 60 chars), "description": string (one sentence, <= 220 chars), "category": one of "Marketing" | "Sales" | "Engineering" | "Ops" | "Finance" | "Support"}. No prose, no markdown fences.',
          },
          { role: "user", content: idea.value },
        ],
        thinking: { type: "disabled" },
      }),
      SDK_TIMEOUT_MS,
      () => null as Awaited<ReturnType<typeof zai.chat.completions.create>> | null,
    );
    const text = completion?.choices[0]?.message?.content ?? "";
    // Session 34: the fence-strip / parse / sanitize chain lives in the
    // pure seam (parseLlmWorkflow, unit-pinned with LLM-shaped outputs);
    // its THROWS-on-non-JSON contract preserves this catch's ownership of
    // the malformed-output failure class.
    const parsed = parseLlmWorkflow(text);
    if (parsed) generated = parsed;
  } catch {
    // SDK unavailable or malformed — the deterministic template stands.
  }

  return ok(generated);
  });
}
