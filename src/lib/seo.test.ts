import { describe, expect, it } from "vitest";
import { DEFAULT_DESCRIPTION, pageDescription, pageTitle, routeMetadata } from "./seo";

describe("pageDescription — the reference's per-route description template", () => {
  // The live emits "X on SAAS Company. {default description}" on the five
  // content routes (measured 2026-10-07; docs/remediation-plan-session6.md F5).
  it("wraps the page name around the default description", () => {
    expect(pageDescription("FAQ")).toBe(`FAQ on SAAS Company. ${DEFAULT_DESCRIPTION}`);
    expect(pageDescription("Privacy")).toBe(`Privacy on SAAS Company. ${DEFAULT_DESCRIPTION}`);
    expect(pageDescription("Terms")).toBe(`Terms on SAAS Company. ${DEFAULT_DESCRIPTION}`);
    expect(pageDescription("Accessibility")).toBe(`Accessibility on SAAS Company. ${DEFAULT_DESCRIPTION}`);
    expect(pageDescription("Refund Policy")).toBe(`Refund Policy on SAAS Company. ${DEFAULT_DESCRIPTION}`);
  });

  it("keeps the default description untouched for the root and /login", () => {
    expect(pageDescription(null)).toBe(DEFAULT_DESCRIPTION);
  });

  it("trims stray whitespace in the page name", () => {
    expect(pageDescription("  FAQ ")).toBe(`FAQ on SAAS Company. ${DEFAULT_DESCRIPTION}`);
  });
});

describe("pageTitle — the reference's og:title pattern", () => {
  it("renders the full templated title for content routes", () => {
    expect(pageTitle("FAQ")).toBe("FAQ | SAAS Company");
    expect(pageTitle("Refund Policy")).toBe("Refund Policy | SAAS Company");
  });

  it("falls back to the bare site name for the root and /login", () => {
    expect(pageTitle(null)).toBe("SAAS Company");
  });
});

describe("routeMetadata — the per-route head assembly", () => {
  it("builds a content route's metadata with the per-page pattern", () => {
    const m = routeMetadata("FAQ");
    expect(m.title).toBe("FAQ");
    expect(m.description).toBe(`FAQ on SAAS Company. ${DEFAULT_DESCRIPTION}`);
    expect(m.alternates?.canonical).toBe("./");
    expect(m.openGraph?.title).toBe("FAQ | SAAS Company");
    expect(m.openGraph?.url).toBe("./");
    expect(m.openGraph?.description).toBe(m.description);
    expect((m.openGraph?.images as Array<{ url: string }>)[0].url).toBe("/og-image.png");
    expect(m.twitter?.title).toBe("FAQ | SAAS Company");
    expect((m.twitter as { card?: string }).card).toBe("summary_large_image");
  });

  it("keeps the default title/description for the root and /login", () => {
    const m = routeMetadata(null);
    expect(m.title).toBeUndefined(); // the root default title applies
    expect(m.description).toBe(DEFAULT_DESCRIPTION);
    expect(m.openGraph?.title).toBe("SAAS Company");
  });
});
