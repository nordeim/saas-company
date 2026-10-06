import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Cookie-session auth (scrypt + HMAC-SHA256) — zero external auth services.
 *
 * - Passwords: scrypt with a per-user 16-byte salt, 64-byte key, stored as
 *   `salt:hash`; verification is timing-safe.
 * - Sessions: stateless tokens `userId.expiry.signature` signed with
 *   AUTH_SECRET, delivered as an httpOnly `novaai_session` cookie (7-day
 *   TTL, SameSite=Lax, Secure in production).
 */

const SESSION_COOKIE = "novaai_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Dev-only fallback — loudly documented; production MUST set AUTH_SECRET.
const DEV_SECRET = "novaai-insecure-dev-secret-change-me";

function secret(): string {
  return process.env.AUTH_SECRET?.trim() || DEV_SECRET;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(userId: string): string {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiryRaw, signature] = parts;
  const expiry = Number(expiryRaw);
  if (!userId || !Number.isFinite(expiry) || expiry < Date.now()) return null;
  const expected = sign(`${userId}.${expiryRaw}`);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Resolve the current session user id from the request cookies (or null). */
export async function sessionUserId(): Promise<string | null> {
  const store = await cookies();
  return parseSessionToken(store.get(SESSION_COOKIE)?.value);
}
