import { describe, expect, it } from "vitest";
import {
  DEFAULT_DESCRIPTION,
  breadcrumbStructuredData,
  faqStructuredData,
  landingStructuredData,
  organizationStructuredData,
  pageDescription,
  pageTitle,
  routeMetadata,
  siteUrl,
  softwareStructuredData,
  websiteStructuredData,
} from "./seo";
import { PLANS } from "./pricing";
import { FAQ_ITEMS } from "./faq-content";

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

// ---------------------------------------------------------------------------
// Session 29 R1 — the JSON-LD structured-data superset (D113): the pure
// builders. The content-as-code law governs: the FAQ entities derive
// VERBATIM from FAQ_ITEMS, the offers derive from PLANS (null price →
// omitted, never an invented "0"), and the description is
// DEFAULT_DESCRIPTION — ONE source of truth per fact, no duplicated copy.
// ---------------------------------------------------------------------------

describe("siteUrl — the canonical public origin", () => {
  it("reads NEXT_PUBLIC_SITE_URL and falls back to localhost:3000", () => {
    const saved = process.env.NEXT_PUBLIC_SITE_URL;
    try {
      process.env.NEXT_PUBLIC_SITE_URL = "https://clone.example.com";
      expect(siteUrl()).toBe("https://clone.example.com");
      delete process.env.NEXT_PUBLIC_SITE_URL;
      expect(siteUrl()).toBe("http://localhost:3000");
    } finally {
      if (saved === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = saved;
    }
  });
});

describe("landingStructuredData — the Organization/WebSite/SoftwareApplication graph", () => {
  const graph = landingStructuredData()["@graph"] as Array<Record<string, unknown>>;

  it("builds a schema.org graph of exactly three linked nodes", () => {
    expect(landingStructuredData()["@context"]).toBe("https://schema.org");
    expect(graph).toHaveLength(3);
    expect(graph.map((n) => n["@type"])).toEqual([
      "Organization",
      "WebSite",
      "SoftwareApplication",
    ]);
  });

  it("links the nodes through stable @id anchors", () => {
    const [org, web, app] = graph;
    const orgId = org["@id"];
    expect(String(orgId).endsWith("/#organization")).toBe(true);
    expect((web as Record<string, Record<string, unknown>>).publisher["@id"]).toBe(orgId);
    expect((app as Record<string, Record<string, unknown>>).publisher["@id"]).toBe(orgId);
    expect(String(web["@id"]).endsWith("/#website")).toBe(true);
    expect(String(app["@id"]).endsWith("/#software")).toBe(true);
  });

  it("the Organization names the site and carries the og-image logo", () => {
    const [org] = graph;
    expect(org.name).toBe("SAAS Company");
    expect(String(org.url).startsWith("http")).toBe(true);
    expect(String(org.logo)).toMatch(/\/og-image\.png$/);
  });

  it("the SoftwareApplication's offers DERIVE from PLANS (the one source of truth)", () => {
    const app = graph[2] as { name: unknown; description: unknown; offers: Array<{ name: unknown; price: unknown }> };
    expect(app.name).toBe("NovaAI");
    expect(app.description).toBe(DEFAULT_DESCRIPTION);
    // The derivation itself: PLANS' monthlyPrice as strings, null dropped
    // (Enterprise is Custom — an Offer without a price is invalid; omitting
    // is the honest representation, never an invented 0).
    const derived = PLANS.filter((p) => p.monthlyPrice !== null).map((p) => ({
      name: p.name,
      price: String(p.monthlyPrice),
    }));
    expect(app.offers).toEqual(
      derived.map((d) => expect.objectContaining({ name: d.name, price: d.price })),
    );
    expect(app.offers).toHaveLength(2); // Free + Pro; Enterprise omitted
    expect(app.offers.map((o) => o.price)).toEqual(["0", "49"]);
    expect(app.offers.every((o) => (o as { priceCurrency?: string }).priceCurrency === "USD")).toBe(true);
  });

  it("survives the JSON round-trip (no Date/undefined loss — it renders through JSON.stringify)", () => {
    const data = landingStructuredData();
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});

describe("faqStructuredData — the FAQPage graph (content-as-code)", () => {
  it("derives the entities VERBATIM from FAQ_ITEMS", () => {
    const data = faqStructuredData();
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("FAQPage");
    const entities = data.mainEntity as Array<{
      "@type": string;
      name: string;
      acceptedAnswer: { "@type": string; text: string };
    }>;
    expect(entities).toHaveLength(FAQ_ITEMS.length);
    expect(entities.length).toBeGreaterThan(0);
    for (let i = 0; i < FAQ_ITEMS.length; i++) {
      expect(entities[i]["@type"]).toBe("Question");
      expect(entities[i].name).toBe(FAQ_ITEMS[i].q);
      expect(entities[i].acceptedAnswer["@type"]).toBe("Answer");
      expect(entities[i].acceptedAnswer.text).toBe(FAQ_ITEMS[i].a);
    }
  });

  it("survives the JSON round-trip", () => {
    const data = faqStructuredData();
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});

// ---------------------------------------------------------------------------
// Session 30 R1 (D115) — the JSON-LD PARITY extension: the live reference
// was redeployed shipping structured data on every route (the drift
// battery's new JSON-LD column caught it — gotcha 7, the reference is a
// moving target). The split builders below match the live's captured
// mount shape (a minimal WebSite + a minimal Organization on EVERY route;
// a BreadcrumbList on the content routes) while keeping the S29 supersets
// (the SoftwareApplication with the PLANS-derived offers; the FAQPage) and
// the stable @id anchors so the cross-script publisher links resolve.
// ---------------------------------------------------------------------------

describe("websiteStructuredData — the sitewide WebSite script (the live's shape + the anchor)", () => {
  it("matches the live's minimal shape with the stable @id anchor and the publisher link", () => {
    const data = websiteStructuredData();
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBe("SAAS Company");
    expect(data.url).toBe(siteUrl());
    // The superset refinements (invisible to rendering, load-bearing for
    // the cross-script linking): the anchor + the Organization publisher.
    expect(String(data["@id"]).endsWith("/#website")).toBe(true);
    expect((data.publisher as Record<string, unknown>)["@id"]).toBe(`${siteUrl()}/#organization`);
  });

  it("survives the JSON round-trip", () => {
    const data = websiteStructuredData();
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});

describe("organizationStructuredData — the sitewide Organization script", () => {
  it("matches the live's shape (name/url/logo) with the working self-hosted logo", () => {
    const data = organizationStructuredData();
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Organization");
    expect(data.name).toBe("SAAS Company");
    expect(data.url).toBe(siteUrl());
    // The live's logo points at its own CDN-hosted favicon SVG; the
    // clone's working equivalent is the self-hosted og-image (the D30
    // working-asset pattern — the live's own og:image/favicon URLs 404).
    expect(String(data.logo).endsWith("/og-image.png")).toBe(true);
    expect(String(data["@id"]).endsWith("/#organization")).toBe(true);
  });

  it("survives the JSON round-trip", () => {
    const data = organizationStructuredData();
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});

describe("softwareStructuredData — the landing's superset node (extracted from the S29 @graph)", () => {
  it("keeps the PLANS-derived offers and the DEFAULT_DESCRIPTION (the one source of truth per fact)", () => {
    const data = softwareStructuredData();
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("SoftwareApplication");
    expect(data.name).toBe("NovaAI");
    expect(data.description).toBe(DEFAULT_DESCRIPTION);
    expect(data.applicationCategory).toBe("BusinessApplication");
    expect(data.operatingSystem).toBe("Web");
    expect((data.publisher as Record<string, unknown>)["@id"]).toBe(`${siteUrl()}/#organization`);
    const derived = PLANS.filter((p) => p.monthlyPrice !== null);
    const offers = data.offers as Array<{ name: string; price: string; priceCurrency: string }>;
    expect(offers).toHaveLength(derived.length);
    expect(offers.map((o) => o.price)).toEqual(["0", "49"]);
    for (let i = 0; i < derived.length; i++) {
      expect(offers[i].name).toBe(derived[i].name);
      expect(offers[i].price).toBe(String(derived[i].monthlyPrice));
      expect(offers[i].priceCurrency).toBe("USD");
    }
  });

  it("agrees with the S29 @graph's SoftwareApplication node (the extraction lost nothing)", () => {
    // The @graph's node carries no @context of its own (the graph root
    // declares it once); a STANDALONE script must. Everything else must
    // be identical — the extraction added the script-level @context and
    // changed nothing.
    const graphNode = (landingStructuredData()["@graph"] as Array<Record<string, unknown>>)[2];
    const { "@context": _standalone, ...node } = softwareStructuredData();
    expect(node).toEqual(graphNode);
  });

  it("survives the JSON round-trip", () => {
    const data = softwareStructuredData();
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});

describe("breadcrumbStructuredData — the content routes' BreadcrumbList (the live's exact shape)", () => {
  it("builds the Home → {page} trail with absolute item URLs through siteUrl()", () => {
    const data = breadcrumbStructuredData("FAQ", "/faq");
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("BreadcrumbList");
    const trail = data.itemListElement as Array<{
      "@type": string;
      position: number;
      name: string;
      item: string;
    }>;
    expect(trail).toHaveLength(2);
    expect(trail[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${siteUrl()}/`,
    });
    expect(trail[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "FAQ",
      item: `${siteUrl()}/faq`,
    });
  });

  it("derives every content route's trail from the route's own metadata stem (content-as-code)", () => {
    // The live-captured names: FAQ, Privacy, Terms, Accessibility, Refund
    // Policy — the SAME stems the routes' routeMetadata() calls render.
    const routes: Array<[string, string]> = [
      ["FAQ", "/faq"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Accessibility", "/accessibility"],
      ["Refund Policy", "/refund-policy"],
      ["Book a Demo", "/demo"],
    ];
    for (const [page, path] of routes) {
      const trail = (breadcrumbStructuredData(page, path).itemListElement) as Array<{ name: string; item: string }>;
      expect(trail[1].name).toBe(page);
      expect(trail[1].item).toBe(`${siteUrl()}${path}`);
    }
  });

  it("survives the JSON round-trip", () => {
    const data = breadcrumbStructuredData("FAQ", "/faq");
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});
