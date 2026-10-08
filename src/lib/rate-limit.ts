/**
 * Fixed-window per-IP rate limiting for the auth endpoints.
 * Pure-function core (checkRate) keeps the window math unit-testable.
 * Buckets live in process memory — per-instance only; restart clears them.
 */

export type RateBuckets = Map<string, { count: number; resetAt: number }>;

export interface RateDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Pure fixed-window check. Records the attempt when allowed and evicts
 * expired entries opportunistically.
 */
export function checkRate(
  buckets: RateBuckets,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateDecision {
  // Opportunistic eviction of expired entries.
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    retryAfterSec: 0,
  };
}

const buckets: RateBuckets = new Map();

/** Auth-endpoint limiter: 10 attempts per IP per 15 minutes.
 *
 * The limit is overridable via AUTH_RATE_LIMIT_MAX (default 10) —
 * deployments behind shared egress IPs raise it; the Playwright webServer
 * sets a high value because the e2e suite's own sign-ins share one IP and
 * one process with the limiter (Session 11: the suite's ~10 UI sign-ins
 * sat at exactly the default budget — any new signed-in spec tripped a
 * mysterious mid-suite 429).
 */
export function authRateLimit(ip: string): RateDecision {
  const raw = Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX ?? "", 10);
  const limit = Number.isFinite(raw) && raw >= 1 ? raw : 10;
  return checkRate(buckets, `auth:${ip}`, limit, 15 * 60 * 1000);
}

/** Newsletter limiter: 5 subscribes per IP per 10 minutes. */
export function newsletterRateLimit(ip: string): RateDecision {
  return checkRate(buckets, `news:${ip}`, 5, 10 * 60 * 1000);
}

/** Generate limiter: 10 LLM generations per USER per 15 minutes
 *  (Session 16 F1 — the composer endpoint's abuse ceiling).
 *
 *  Keyed by the authenticated USER id, not the IP: the route sits behind
 *  requireSession, so the user is the honest unit (a shared-egress office
 *  does not share one abuser's budget). The limit is overridable via
 *  GENERATE_RATE_LIMIT_MAX (the AUTH_RATE_LIMIT_MAX operator pattern) —
 *  the Playwright webServer pins 50 and the smoke suite pins 2 for its
 *  deterministic trip.
 */
export function generateRateLimit(userId: string): RateDecision {
  const raw = Number.parseInt(process.env.GENERATE_RATE_LIMIT_MAX ?? "", 10);
  const limit = Number.isFinite(raw) && raw >= 1 ? raw : 10;
  return checkRate(buckets, `gen:${userId}`, limit, 15 * 60 * 1000);
}

/** Workflow-create limiter: 30 creates per USER per 15 minutes
 *  (Session 21 R2 — the creation-frequency ceiling).
 *
 *  POST /api/workflows was the ONLY unthrottled mutation in the app
 *  (auth, newsletter, demo, and generate all carry limiters): a script
 *  minted unbounded rows — one tiny JSON POST each — growing the
 *  database and the user's own unbounded list. Keyed by the
 *  authenticated USER (the generateRateLimit pattern: the route sits
 *  behind requireSession, so the user is the honest unit — a
 *  shared-egress office does not share one abuser's budget).
 *
 *  30 is generous by design: a power user hand-building 30 workflows
 *  in 15 minutes is plausible; a script minting 1,000 rows in seconds
 *  is not. Overridable via WORKFLOW_RATE_LIMIT_MAX (the
 *  AUTH_RATE_LIMIT_MAX operator pattern) — the smoke server pins 2
 *  for its deterministic trip.
 */
export function workflowRateLimit(userId: string): RateDecision {
  const raw = Number.parseInt(process.env.WORKFLOW_RATE_LIMIT_MAX ?? "", 10);
  const limit = Number.isFinite(raw) && raw >= 1 ? raw : 30;
  return checkRate(buckets, `wf:${userId}`, limit, 15 * 60 * 1000);
}

/** Best-effort client IP (single trusted proxy assumed).
 *
 * Session 18 F4 (the trust model, stated honestly): the FIRST
 * x-forwarded-for hop is trusted VERBATIM. Correct behind one proxy that
 * overwrites the header (Cloudflare/nginx/Traefik); a DIRECTLY exposed
 * deployment accepts client-supplied values — a header-rotating script
 * mints a fresh auth bucket per request and the limit never engages.
 * Front public deployments with such a proxy (docs/DEPLOYMENT.md §2).
 */
export function clientIpOf(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
