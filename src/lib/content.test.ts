import { describe, expect, it } from "vitest";
import { FAQ_ITEMS } from "./faq-content";
import { ACCESSIBILITY, PRIVACY, REFUND_POLICY, TERMS } from "./legal-content";

describe("FAQ content", () => {
  it("carries the reference's six questions", () => {
    expect(FAQ_ITEMS).toHaveLength(6);
    expect(FAQ_ITEMS[0].q).toBe("Is my data secure with NovaAI?");
  });

  it("has no duplicate questions and every answer is substantive", () => {
    const questions = FAQ_ITEMS.map((i) => i.q);
    expect(new Set(questions).size).toBe(questions.length);
    for (const item of FAQ_ITEMS) {
      expect(item.a.length).toBeGreaterThan(40);
    }
  });
});

describe("legal content", () => {
  const pages = [
    ["privacy", PRIVACY],
    ["terms", TERMS],
    ["accessibility", ACCESSIBILITY],
    ["refund-policy", REFUND_POLICY],
  ] as const;

  it("exposes all four pages with titles", () => {
    for (const [slug, page] of pages) {
      expect(page.title.length, `${slug} title`).toBeGreaterThan(3);
      expect(page.sections.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("gives every section at least one paragraph of body text", () => {
    for (const [slug, page] of pages) {
      for (const section of page.sections) {
        const label = `${slug} section ${section.h2 ?? "(intro)"}`;
        expect(section.paras.length, label).toBeGreaterThan(0);
      }
    }
  });

  it("shows the disclaimer caption on privacy/terms/refund-policy but NOT accessibility (reference parity)", () => {
    // The live reference renders the "A legal disclaimer" caption on three
    // of the four legal pages and omits it on the accessibility page.
    expect(PRIVACY.disclaimer).toBe("A legal disclaimer");
    expect(TERMS.disclaimer).toBe("A legal disclaimer");
    expect(REFUND_POLICY.disclaimer).toBe("A legal disclaimer");
    expect(ACCESSIBILITY.disclaimer).toBeNull();
  });

  it("accessibility page carries the reference's 8-item commitment list", () => {
    const section = ACCESSIBILITY.sections.find((s) => s.h2 === "Accessibility Adjustments on This Site");
    expect(section).toBeDefined();
    expect(section?.list).toBeDefined();
    expect(section?.list?.style).toBe("disc");
    expect(section?.list?.items).toEqual([
      "Used the Accessibility Wizard to find and fix potential accessibility issues",
      "Set the language of the site",
      "Set the content order of the site's pages",
      "Defined clear heading structures on all of the site's pages",
      "Added alternative text to images",
      "Implemented color combinations that meet the required color contrast",
      "Reduced the use of motion on the site",
      "Ensured all videos, audio, and files on the site are accessible",
    ]);
  });

  it("accessibility page carries the reference's 4-item coordinator contact list", () => {
    const section = ACCESSIBILITY.sections.find((s) => s.h2 === "Requests, Issues, and Suggestions");
    expect(section).toBeDefined();
    expect(section?.list).toBeDefined();
    expect(section?.list?.style).toBe("none");
    expect(section?.list?.items).toEqual([
      "[Name of the accessibility coordinator]",
      "[Telephone number of the accessibility coordinator]",
      "[Email address of the accessibility coordinator]",
      "[Enter any additional contact details if relevant / available]",
    ]);
  });

  it("other legal pages carry no lists (parity with the reference)", () => {
    for (const [slug, page] of pages) {
      if (slug === "accessibility") continue;
      for (const section of page.sections) {
        expect(section.list, `${slug} ${section.h2}`).toBeUndefined();
      }
    }
  });
});
