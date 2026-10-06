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

  it("exposes all four pages with titles and disclaimers", () => {
    for (const [slug, page] of pages) {
      expect(page.title.length, `${slug} title`).toBeGreaterThan(3);
      expect(page.disclaimer.length).toBeGreaterThan(3);
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
});
