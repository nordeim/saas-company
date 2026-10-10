import { describe, expect, it } from "vitest";
import {
  HEAD_SUPERSET,
  isDocumentedSuperset,
  DOM_ATTR_SUPERSET,
  isDocumentedDomSuperset,
} from "./head-superset";

/**
 * Session 33 R1 (F4) — the documented-superset registry's shape pins.
 *
 * The registry is the VERSIONED source of truth the drift battery reads
 * (the tsx eval in research/drift-battery-s33.mjs): through Session 32
 * the adjudicated clone-only set lived only in the gitignored research
 * scratch, so a NEW clone-only tag would have blended silently into the
 * "superset" reading. These pins hold the registry to its documented
 * shape — adding an entry is an explicit, reviewed act that touches
 * this file; REMOVING one (an entry going stale when the live
 * redeploys) fails the same pins.
 *
 * The expected values come from the measured adjudications, never from
 * the registry itself (the tdd skill's anti-tautology law): the five
 * S32 head entries and the three S33 DOM entries are the session
 * records — D120–D123 and the focused-probe evidence.
 */

describe("HEAD_SUPERSET — the five S32 adjudications", () => {
  it("carries exactly the five adjudicated clone-only head tags", () => {
    expect(HEAD_SUPERSET.map((e) => e.key).sort()).toEqual([
      "name:next-size-adjust",
      "name:robots",
      "prop:og:image:height",
      "prop:og:image:type",
      "prop:og:image:width",
    ]);
  });

  it("scopes the 404 robots to the unknown-route spelling only", () => {
    const robots = HEAD_SUPERSET.find((e) => e.key === "name:robots");
    expect(robots).toBeDefined();
    expect(robots!.routes).toEqual(["/does-not-exist-404"]);
  });

  it("scopes the other four to every route", () => {
    for (const e of HEAD_SUPERSET) {
      if (e.key === "name:robots") continue;
      expect(e.routes).toBe("all");
    }
  });

  it("carries the adjudication reason and session on every entry", () => {
    for (const e of HEAD_SUPERSET) {
      expect(e.reason.length).toBeGreaterThan(20);
      expect(e.session).toBeGreaterThanOrEqual(32);
    }
  });
});

describe("isDocumentedSuperset — the head lookup truth table", () => {
  it("the og:image dims are documented on every route", () => {
    for (const route of ["/", "/login", "/faq", "/privacy", "/terms", "/accessibility", "/refund-policy", "/does-not-exist-404"]) {
      expect(isDocumentedSuperset("prop:og:image:width", route)).toBe(true);
      expect(isDocumentedSuperset("prop:og:image:height", route)).toBe(true);
      expect(isDocumentedSuperset("prop:og:image:type", route)).toBe(true);
    }
  });

  it("the 404 robots is documented ONLY on the 404 route", () => {
    expect(isDocumentedSuperset("name:robots", "/does-not-exist-404")).toBe(true);
    expect(isDocumentedSuperset("name:robots", "/")).toBe(false);
    expect(isDocumentedSuperset("name:robots", "/login")).toBe(false);
  });

  it("an unknown tag is never documented", () => {
    expect(isDocumentedSuperset("name:some-new-telemetry", "/")).toBe(false);
    expect(isDocumentedSuperset("prop:og:never-heard-of", "/faq")).toBe(false);
  });
});

describe("DOM_ATTR_SUPERSET — the three S33 adjudications", () => {
  it("carries exactly the three measured DOM-attribute entries with their sides", () => {
    expect(DOM_ATTR_SUPERSET.map((e) => `${e.side}:${e.attr}`).sort()).toEqual([
      "clone:data-nav-theme",
      "live:data-radix-collection-item",
      "live:data-rht-toaster",
    ]);
  });

  it("scopes each entry to its measured route", () => {
    const byAttr = new Map(DOM_ATTR_SUPERSET.map((e) => [e.attr, e]));
    expect(byAttr.get("data-nav-theme")!.routes).toEqual(["/"]);
    expect(byAttr.get("data-rht-toaster")!.routes).toEqual(["/login"]);
    expect(byAttr.get("data-radix-collection-item")!.routes).toEqual(["/faq"]);
  });

  it("carries the adjudication reason and session on every entry", () => {
    for (const e of DOM_ATTR_SUPERSET) {
      expect(e.reason.length).toBeGreaterThan(20);
      expect(e.session).toBe(33);
    }
  });
});

describe("isDocumentedDomSuperset — the DOM lookup truth table", () => {
  it("the clone's navbar theme marker is documented on / only", () => {
    expect(isDocumentedDomSuperset("data-nav-theme", "clone", "/")).toBe(true);
    expect(isDocumentedDomSuperset("data-nav-theme", "clone", "/faq")).toBe(false);
  });

  it("the live's dormant toaster is documented on /login only", () => {
    expect(isDocumentedDomSuperset("data-rht-toaster", "live", "/login")).toBe(true);
    expect(isDocumentedDomSuperset("data-rht-toaster", "live", "/")).toBe(false);
  });

  it("the live's radix collection marker is documented on /faq only", () => {
    expect(isDocumentedDomSuperset("data-radix-collection-item", "live", "/faq")).toBe(true);
    expect(isDocumentedDomSuperset("data-radix-collection-item", "live", "/privacy")).toBe(false);
  });

  it("an unknown attribute is never documented — the drift the registry exists to catch", () => {
    expect(isDocumentedDomSuperset("data-brand-new-telemetry", "clone", "/")).toBe(false);
    expect(isDocumentedDomSuperset("data-whatever", "live", "/terms")).toBe(false);
  });

  it("the side must match — a clone-only entry never excuses the live side (and vice versa)", () => {
    expect(isDocumentedDomSuperset("data-nav-theme", "live", "/")).toBe(false);
    expect(isDocumentedDomSuperset("data-rht-toaster", "clone", "/login")).toBe(false);
  });
});
