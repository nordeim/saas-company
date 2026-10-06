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

  it("returns the list price monthly and the discounted price annual", () => {
    expect(monthlyPriceFor(PLANS[1], "monthly")).toBe(39);
    // 20% off, rounded to the dollar (the reference advertises Save 20%).
    expect(monthlyPriceFor(PLANS[1], "annual")).toBe(31);
  });

  it("applies exactly the advertised 20% annual discount", () => {
    const annual = monthlyPriceFor(PLANS[1], "annual")!;
    const expected = Math.round(39 * (1 - ANNUAL_DISCOUNT));
    expect(annual).toBe(expected);
  });
});

describe("captions", () => {
  it("renders price captions per plan/period", () => {
    expect(priceCaptionFor(PLANS[0], "monthly")).toBe("$0");
    expect(priceCaptionFor(PLANS[1], "monthly")).toBe("$39");
    expect(priceCaptionFor(PLANS[1], "annual")).toBe("$31");
    expect(priceCaptionFor(PLANS[2], "annual")).toBe("Custom");
  });

  it("switches the period caption", () => {
    expect(periodCaption("monthly")).toBe("/month");
    expect(periodCaption("annual")).toBe("/month, billed annually");
  });
});

describe("type narrowness", () => {
  it("accepts only the two billing periods", () => {
    const periods: BillingPeriod[] = ["monthly", "annual"];
    expect(periods).toHaveLength(2);
  });
});
