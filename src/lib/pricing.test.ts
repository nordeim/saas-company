import { describe, expect, it } from "vitest";
import {
  ANNUAL_DISCOUNT,
  PLANS,
  monthlyPriceFor,
  periodCaption,
  priceCaptionFor,
  type BillingPeriod,
} from "./pricing";

describe("pricing plans", () => {
  it("exposes the three reference plans in order", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["free", "pro", "enterprise"]);
    expect(PLANS[1].popular).toBe(true);
  });

  it("carries the reference feature lists", () => {
    expect(PLANS[0].features).toContain("Up to 3 workflows");
    expect(PLANS[1].features).toContain("API access");
    expect(PLANS[2].features).toContain("On-premise deployment");
  });
});

describe("monthlyPriceFor", () => {
  it("returns null for Custom (enterprise) under any period", () => {
    expect(monthlyPriceFor(PLANS[2], "monthly")).toBeNull();
    expect(monthlyPriceFor(PLANS[2], "annual")).toBeNull();
  });

  it("keeps the Free plan at $0 under any period", () => {
    expect(monthlyPriceFor(PLANS[0], "monthly")).toBe(0);
    expect(monthlyPriceFor(PLANS[0], "annual")).toBe(0);
  });

  it("returns the live's monthly list price and the annual default price", () => {
    // Session 4 audit: the live defaults to ANNUAL with Pro at $39/mo —
    // the $39 Session 1 read was the ANNUAL price (it never checked which
    // pill was active). Monthly is $49; 49→39 is the advertised ~20%.
    expect(monthlyPriceFor(PLANS[1], "monthly")).toBe(49);
    expect(monthlyPriceFor(PLANS[1], "annual")).toBe(39);
  });

  it("applies the advertised ~20% annual discount to the monthly price", () => {
    const annual = monthlyPriceFor(PLANS[1], "annual")!;
    const expected = Math.round(49 * (1 - ANNUAL_DISCOUNT));
    expect(annual).toBe(expected);
  });
});

describe("captions", () => {
  it("renders price captions per plan/period", () => {
    expect(priceCaptionFor(PLANS[0], "monthly")).toBe("$0");
    expect(priceCaptionFor(PLANS[1], "monthly")).toBe("$49");
    expect(priceCaptionFor(PLANS[1], "annual")).toBe("$39");
    expect(priceCaptionFor(PLANS[2], "annual")).toBe("Custom");
  });

  it("keeps the period caption at /month in BOTH states (live parity)", () => {
    // The live renders plain "/month" next to the price in monthly AND
    // annual states — no "billed annually" suffix anywhere on the page.
    expect(periodCaption("monthly")).toBe("/month");
    expect(periodCaption("annual")).toBe("/month");
  });
});

describe("type narrowness", () => {
  it("accepts only the two billing periods", () => {
    const periods: BillingPeriod[] = ["monthly", "annual"];
    expect(periods).toHaveLength(2);
  });
});
