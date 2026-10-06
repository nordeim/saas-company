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
