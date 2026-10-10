import { expect, test } from "@playwright/test";
import { FAQ_ITEMS } from "../../src/lib/faq-content";
import { PLANS } from "../../src/lib/pricing";

/**
 * Session 29 R1 (D113) — the JSON-LD structured-data pins: the SEO
 * SUPERSET the production-ready clone adds beyond the reference (the
 * reference ships NO structured data — it is a Base44-hosted SPA, no
 * parity constraint, the D62 family; probed across all 8 public routes
 * this session: application/ld+json ×0).
 *
 * The mount surface (deliberately minimal and valid): the LANDING
 * carries the Organization + WebSite + SoftwareApplication graph (the
 * pricing offers derived from PLANS), /faq carries the FAQPage graph
 * (the entities derived VERBATIM from FAQ_ITEMS — content-as-code).
 *
 * These are the FIRST e2e specs to import from src/ (the pure content
 * modules — FAQ_ITEMS and PLANS — so the pinned expectations derive
 * from the SAME source of truth the schema renders from: a pricing
 * change or a FAQ edit flips the pin, never drifts silently past it).
 *
 * Safety probed before authoring: the script renders into the page HTML
 * but never into document.body.innerText (the word-parity battery is
 * immune), creates NO resource-timing entry (the script-transfer
 * budgets are immune), and has no box (the CLS budgets are immune).
 */

interface GraphNode {
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
}

interface FaqEntity {
  "@type"?: string;
  name?: string;
  acceptedAnswer?: { "@type"?: string; text?: string };
}

/** Parse every application/ld+json script on the page. */
async function ldJsonScripts(page: import("@playwright/test").Page): Promise<unknown[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) =>
      JSON.parse(s.textContent ?? "null"),
    ),
  );
}

test.describe("JSON-LD structured data (Session 29 R1 — the SEO superset)", () => {
  test("the landing serves ONE valid graph: Organization + WebSite + SoftwareApplication with the PLANS-derived offers", async ({ page }) => {
    await page.goto("/");
    const scripts = await ldJsonScripts(page);
    expect(scripts).toHaveLength(1);

    const data = scripts[0] as { "@context"?: string; "@graph"?: GraphNode[] };
    expect(data["@context"]).toBe("https://schema.org");
    const graph = data["@graph"] ?? [];
    expect(graph.map((n) => n["@type"])).toEqual(["Organization", "WebSite", "SoftwareApplication"]);

    // The nodes link through stable @id anchors (WebSite and the app
    // both name the Organization as publisher).
    const [org, web, app] = graph;
    expect(org["@id"]).toBeTruthy();
    expect(web.publisher?.["@id"]).toBe(org["@id"]);
    expect(app.publisher?.["@id"]).toBe(org["@id"]);

    // The Organization names the site.
    expect(org.name).toBe("SAAS Company");

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

  test("the FAQ route serves ONE valid FAQPage whose entities derive VERBATIM from FAQ_ITEMS", async ({ page }) => {
    await page.goto("/faq");
    const scripts = await ldJsonScripts(page);
    expect(scripts).toHaveLength(1);

    const data = scripts[0] as { "@context"?: string; "@type"?: string; mainEntity?: FaqEntity[] };
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("FAQPage");

    // The content-as-code law: the schema's Q&A IS the reference-captured
    // FAQ_ITEMS — length, question, and answer verbatim. A FAQ edit that
    // skips the schema flips this pin (never drifts silently).
    const entities = data.mainEntity ?? [];
    expect(entities).toHaveLength(FAQ_ITEMS.length);
    for (let i = 0; i < FAQ_ITEMS.length; i++) {
      expect(entities[i]["@type"]).toBe("Question");
      expect(entities[i].name).toBe(FAQ_ITEMS[i].q);
      expect(entities[i].acceptedAnswer?.["@type"]).toBe("Answer");
      expect(entities[i].acceptedAnswer?.text).toBe(FAQ_ITEMS[i].a);
    }
  });
});
