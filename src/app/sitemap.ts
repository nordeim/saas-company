import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  // The URL set is the live's own policy (Session 37 D141, superseded
  // Session 43): every public content route the live lists + the /demo
  // superset (S14) — the LIVE's sitemap does NOT list its login page,
  // and neither do we. The live's /thank-you IS in its sitemap — the
  // payment-success interstitial (Session 43 R1: the A2 probe disproved
  // the old "newsletter-success route, no clone equivalent" story — the
  // live's newsletter form does NOT navigate there; the page is the
  // checkout-success destination, now built at measured parity). The
  // clone's set is the live's 7 + /demo = the STRICT superset.
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/thank-you`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
