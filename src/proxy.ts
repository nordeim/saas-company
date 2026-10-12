import { NextResponse, type NextRequest } from "next/server";

/**
 * The case-canonicalization proxy (Session 44, D149) — Next 16's
 * middleware convention, renamed `proxy` (the same API; the file
 * convention deprecation answered by using the modern name from day one).
 *
 * THE PARITY STORY: the live reference (`saas-company.base44.app`) is an
 * SPA whose client router matches paths case-INSENSITIVELY — /FAQ, /Faq,
 * /FaQ, /THANK-YOU, /Privacy, /TERMS, /Accessibility, /Refund-Policy all
 * serve their pages there (measured, research/adj3-s44.mjs P2 + the
 * follow-up sweep; only /LOGIN — the live's separate Base44 auth page —
 * stays case-sensitive, and its soft-404 routes stay 404 at any casing).
 * Until this middleware the clone 404'd every case variant — the Session-43
 * /thank-you family again: the clone 404ing what the live serves working.
 *
 * THE CONTRACT: any case variant of a KNOWN page route answers **308**
 * (Permanent Redirect) to the lowercase canonical — the honest-status
 * family (the trailing-slash 308 precedent, D151): the live serves
 * duplicate 200s at every casing with only the canonical tag
 * self-correcting; the clone serves the single canonical URL at the
 * status-code layer. /LOGIN, /DEMO and /DASHBOARD variants redirect too —
 * the live FAILS all three (its /LOGIN case-sensitively, /DEMO and
 * /DASHBOARD at any casing) — so the clone stays the functional superset.
 *
 * THE RULES (pinned by session44-urlstate-selection-surface.spec.ts):
 * - the set is the app's PAGE routes ONLY (API routes, /_next chunks, and
 *   public static assets are never in it — a cased /OG-IMAGE.PNG passes
 *   through to the honest 404, never a redirect);
 * - a single trailing slash is normalized in the SAME redirect (/FAQ/ ->
 *   /faq in ONE hop — Next's own trailing-slash 308 would otherwise fire
 *   a second);
 * - the query string is preserved verbatim (/FAQ?utm_source=test ->
 *   /faq?utm_source=test — the /login?from_url=... flow survives);
 * - unknown routes pass through untouched (the honest 404 — /PRICING is
 *   not a route on EITHER side; both sides fail it honestly);
 * - hash fragments are client-only (never sent to the server) — the
 *   browser re-attaches them after the redirect.
 *
 * Edge-surface note: this file is edge-runtime-safe by construction (no
 * Node APIs — pure NextResponse work). The instrumentation hook's static
 * node:fs import stays build-safe because `register()` keeps its
 * NEXT_RUNTIME === "edge" early-return; verified on the real standalone
 * build (Session 44 F4 — the middleware-manifest is non-empty now, and
 * the boot warning still lands on the Node runtime).
 */

/** The app's page routes — the canonicalization domain. Keep in sync with
 *  the route tree under src/app/ (the spec's sweep pins the full set). */
const PAGE_ROUTES = new Set([
  "/",
  "/login",
  "/demo",
  "/faq",
  "/thank-you",
  "/privacy",
  "/terms",
  "/accessibility",
  "/refund-policy",
  "/dashboard",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // lowercase + a single trailing slash stripped (root "/" exempt)
  const lower = pathname.toLowerCase();
  const stripped = lower.length > 1 && lower.endsWith("/") ? lower.slice(0, -1) : lower;
  // redirect ONLY when the request differs from a known route's canonical
  // spelling — exact-case requests pass through (the "/" and "/faq" hits
  // of the world never pay a redirect), unknowns keep the honest 404
  if (stripped !== pathname && PAGE_ROUTES.has(stripped)) {
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  // Skip the API surface (its paths are lowercase by construction; a
  // cased /API/... passes to the framework's honest 405/404) and Next's
  // internal chunks. Public static files (og-image.png, favicon.svg,
  // manifest.json, /media/*) run through the set lookup and pass — they
  // are not page routes.
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
