/** Input validation helpers — every API route validates before persisting. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.trim().length <= 254 && EMAIL_RE.test(value.trim());
}

/** Trim + clamp a string field; returns null for empty input. */
export function cleanString(
  value: unknown,
  max: number,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/** Require a non-empty string field within bounds. */
export function requiredString(
  value: unknown,
  max: number,
  field: string,
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { ok: false, error: `${field} is required.` };
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    return { ok: false, error: `${field} must be at most ${max} characters.` };
  }
  return { ok: true, value: trimmed };
}

/** Password policy: 8+ chars (matches the reference's minimum). */
export function isValidPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

/**
 * A same-site redirect target (the CWE-601 guard for /login?from_url=):
 * only internal, absolute-path references survive; every external or
 * ambiguous spelling falls back to the dashboard.
 *
 * Belt and braces: the explicit prefix checks reject the known vectors
 * (absolute URLs, protocol-relative `//`, the `/\` backslash-normalization
 * trick, scheme-prefixed values), and a WHATWG parse against a dummy
 * origin re-serializes whatever the browser's URL parser would do with
 * the rest — any value whose origin escapes the dummy is external.
 */
export function safeRedirectPath(raw: unknown): string {
  const fallback = "/dashboard";
  if (typeof raw !== "string") return fallback;
  const s = raw.trim();
  if (!s.startsWith("/") || s.startsWith("//") || s.startsWith("/\\")) {
    return fallback;
  }
  try {
    const u = new URL(s, "http://localhost");
    if (u.origin !== "http://localhost") return fallback;
    return u.pathname + u.search + u.hash || fallback;
  } catch {
    return fallback;
  }
}
