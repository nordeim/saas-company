import { expect, test } from "@playwright/test";
import { FAQ_ITEMS } from "../../src/lib/faq-content";
import { PLANS } from "../../src/lib/pricing";

/**
 * Session 29 R1 (D113) → Session 30 R1 (D115) — the JSON-LD structured-data
 * pins, EVOLVED to the parity mount structure.
 *
 * The S29 audit found ZERO application/ld+json anywhere (the clone shipped
 * the @graph superset; the reference shipped none — both true at their
 * measurement times). The S30 drift battery's new JSON-LD column then
 * caught the reference's REDEPLOYMENT: the live NOW ships a minimal
 * WebSite + Organization pair on EVERY route plus a BreadcrumbList on the
 * content routes (gotcha 7 — the reference is a moving target). The clone
 * now matches that pattern (the pair mounted once in the root layout; the
 * breadcrumbs on the content routes) and keeps the supersets (the
 * SoftwareApplication with the PLANS-derived offers on the landing; the
 * FAQPage on /faq; the @id anchor linking across scripts).
 *
 * These remain the e2e specs importing from src/ (the pure content modules
 * — FAQ_ITEMS and PLANS — so the pinned expectations derive from the SAME
 * source of truth the schema renders from: a pricing change or a FAQ edit
 * flips the pin, never drifts silently past it).
 *
 * Safety probed before authoring (S29) and re-verified against the live's
 * OWN mounted scripts (S30): the scripts render into the page HTML but
 * never into document.body.innerText (the word-parity battery is immune),
 * create NO resource-timing entry (the script-transfer budgets are
 * immune), and have no box (the CLS budgets are immune).
 */

interface Node {
  "@type"?: string;
  "@id"?: string;
  name?: string;
  url?: string;
  logo?: string;
  publisher?: { "@id"?: string };
  description?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: Array<{ "@type"?: string; name?: string; price?: string; priceCurrency?: string }>;
  itemListElement?: Array<{ "@type"?: string; position?: number; name?: string; item?: string }>;
}

interface FaqEntity {
  "@type"?: string;
  name?: string;
  acceptedAnswer?: { "@type"?: string; text?: string };
}

/** Parse every application/ld+json script on the page. */
async function ldJsonScripts(page: import("@playwright/test").Page): Promise<Node[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) =>
      JSON.parse(s.textContent ?? "null"),
    ),
  );
}

test.describe("JSON-LD structured data (Session 30 R1 — the parity mount + the supersets)", () => {
  test("the landing serves the sitewide pair + the SoftwareApplication superset with the PLANS-derived offers", async ({ page }) => {
    await page.goto("/");
    const scripts = await ldJsonScripts(page);
    // The live's sitewide pair + the clone's superset node = 3 scripts.
    expect(scripts).toHaveLength(3);
    expect(scripts.map((s) => s["@type"])).toEqual(["WebSite", "Organization", "SoftwareApplication"]);

    const [web, org, app] = scripts;

    // The sitewide pair matches the live's redeployed shape (name + url,
    // the Organization's logo) — mounted in the root layout.
    expect(web.name).toBe("SAAS Company");
    expect(web.url).toContain("://");
    expect(org.name).toBe("SAAS Company");
    expect(String(org.logo)).toMatch(/\/og-image\.png$/);

    // The @id linking now runs CROSS-SCRIPT: the WebSite and the
    // SoftwareApplication both name the Organization as publisher through
    // the shared anchor (schema.org resolves @ids across scripts).
    expect(web.publisher?.["@id"]).toBe(org["@id"]);
    expect(app.publisher?.["@id"]).toBe(org["@id"]);
    expect(String(org["@id"]).endsWith("/#organization")).toBe(true);
    expect(String(web["@id"]).endsWith("/#website")).toBe(true);
    expect(String(app["@id"]).endsWith("/#software")).toBe(true);

    // The SoftwareApplication's offers DERIVE from PLANS — the same
    // source of truth the pricing cards render from: every non-null
    // monthlyPrice becomes an Offer at that price; Enterprise's null
    // ("Custom") is OMITTED (an Offer without a price is invalid
    // schema; inventing a "0" would be a lie).
    const derived = PLANS.filter((p) => p.monthlyPrice !== null);
    expect(app.offers).toHaveLength(derived.length);
    for (let i = 0; i < derived.length; i++) {
      expect(app.offers?.[i]).toMatchObject({
        "@type": "Offer",
        name: derived[i].name,
        price: String(derived[i].monthlyPrice),
        priceCurrency: "USD",
      });
    }
    expect(app.offers?.map((o) => o.price)).toEqual(["0", "49"]);
    expect(app.name).toBe("NovaAI");
    expect(app.applicationCategory).toBe("BusinessApplication");
    expect(app.operatingSystem).toBe("Web");
  });

  test("the FAQ route serves the pair + the FAQPage superset + the BreadcrumbList", async ({ page }) => {
    await page.goto("/faq");
    const scripts = await ldJsonScripts(page);
    expect(scripts.map((s) => s["@type"])).toEqual(["WebSite", "Organization", "FAQPage", "BreadcrumbList"]);

    // The content-as-code law: the schema's Q&A IS the reference-captured
    // FAQ_ITEMS — length, question, and answer verbatim. A FAQ edit that
    // skips the schema flips this pin (never drifts silently).
    const faq = scripts[2] as { mainEntity?: FaqEntity[] };
    const entities = faq.mainEntity ?? [];
    expect(entities).toHaveLength(FAQ_ITEMS.length);
    for (let i = 0; i < FAQ_ITEMS.length; i++) {
      expect(entities[i]["@type"]).toBe("Question");
      expect(entities[i].name).toBe(FAQ_ITEMS[i].q);
      expect(entities[i].acceptedAnswer?.["@type"]).toBe("Answer");
      expect(entities[i].acceptedAnswer?.text).toBe(FAQ_ITEMS[i].a);
    }

    // The breadcrumb trail: Home → FAQ with absolute items (the live's
    // captured shape).
    const crumbs = scripts[3].itemListElement ?? [];
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].name).toBe("Home");
    expect(String(crumbs[0].item)).toMatch(/\/$/);
    expect(crumbs[1].name).toBe("FAQ");
    expect(String(crumbs[1].item)).toMatch(/\/faq$/);
    expect(crumbs.map((c) => c.position)).toEqual([1, 2]);
  });

  test("the sitewide WebSite + Organization pair serves on EVERY public route (the live's every-route pattern)", async ({ page }) => {
    for (const route of ["/login", "/privacy", "/terms", "/accessibility", "/refund-policy", "/demo", "/does-not-exist-404"]) {
      await page.goto(route);
      const scripts = await ldJsonScripts(page);
      const types = scripts.map((s) => s["@type"]);
      expect(types, `route ${route}`).toContain("WebSite");
      expect(types, `route ${route}`).toContain("Organization");
      // The superset nodes stay MINIMAL-MOUNT: no SoftwareApplication and
      // no FAQPage outside the landing and /faq.
      expect(types, `route ${route}`).not.toContain("SoftwareApplication");
      expect(types, `route ${route}`).not.toContain("FAQPage");
    }
  });

  test("the BreadcrumbList serves on the content routes with the live-captured names", async ({ page }) => {
    // The live's five content routes + the clone's superset /demo. The
    // crumb names are the SAME stems the routes' routeMetadata() calls
    // render — content-as-code, never re-typed copy.
    const routes: Array<[string, string]> = [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Accessibility", "/accessibility"],
      ["Refund Policy", "/refund-policy"],
      ["Book a Demo", "/demo"],
    ];
    for (const [name, path] of routes) {
      await page.goto(path);
      const scripts = await ldJsonScripts(page);
      const crumbs = scripts.filter((s) => s["@type"] === "BreadcrumbList");
      expect(crumbs, `route ${path}`).toHaveLength(1);
      const trail = crumbs[0].itemListElement ?? [];
      expect(trail).toHaveLength(2);
      expect(trail[0].name).toBe("Home");
      expect(trail[1].name).toBe(name);
      expect(String(trail[1].item)).toMatch(new RegExp(`${path.replace("/", "\\/")}$`));
      expect(trail.map((c) => c.position)).toEqual([1, 2]);
    }
    // /login carries NO breadcrumb (the live's own pattern — it is not a
    // content route).
    await page.goto("/login");
    const types = (await ldJsonScripts(page)).map((s) => s["@type"]);
    expect(types).not.toContain("BreadcrumbList");
  });
});
