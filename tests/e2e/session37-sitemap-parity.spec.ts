import { expect, test } from "@playwright/test";

/**
 * Session 37 — the sitemap policy pin (the extra phase's finding D141).
 *
 * The standing-verification phase compares the clone's sitemap against
 * the live's through the documented superset contract —
 *   clone == live − {/thank-you} + {/demo}
 * (the /demo superset is the S14 SEO surface, pinned in demo.spec; the
 * live's /thank-you newsletter-success route is answered by the clone's
 * inline role=status confirmation). The first run of the contract caught
 * ONE undocumented clone-only entry: `/login` — the LIVE's own sitemap
 * does NOT list its login page (login surfaces are conventionally
 * omitted from sitemaps; the live lists only its public content routes).
 * The clone's /login row had no superset story — parity-honest fix:
 * remove it, matching the live's policy exactly.
 */
test("the sitemap matches the live's policy: the public content routes + the /demo superset, never /login (D141)", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/^https?:\/\/[^/]+/, ""),
  );
  expect(urls).toContain("/");
  expect(urls).toContain("/demo"); // the documented S14 superset
  // the live's own policy: the login page is NOT a sitemap citizen
  expect(urls).not.toContain("/login");
  // the full parity set (sorted, the documented contract)
  expect([...urls].sort()).toEqual([
    "/", "/accessibility", "/demo", "/faq", "/privacy", "/refund-policy", "/terms",
  ]);
});
