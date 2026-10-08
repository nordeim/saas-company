import { describe, expect, it } from "vitest";
import { MAX_WORKFLOW_LIST, statsFromAggregate } from "./workflow";

/**
 * Session 21 R1 — the workflows list ceiling (the OUTPUT twin of the S20
 * request-size ceiling, D94): probed, GET /api/workflows answered a
 * 134.5KB body for a 400-workflow user with no `take` anywhere, and the
 * dashboard mounted 400 article cards (9,649 DOM nodes). The fix caps the
 * SQL fetch at MAX_WORKFLOW_LIST and moves the four stat cards to
 * server-side aggregates — a ceiling without honest aggregates would turn
 * the cards into subset summaries (a lie).
 */
describe("MAX_WORKFLOW_LIST — the list ceiling (Session 21 R1)", () => {
  it("is 100 — two orders above the 6-row demo story, the honest unpaginated ceiling", () => {
    expect(MAX_WORKFLOW_LIST).toBe(100);
  });
});

describe("statsFromAggregate — the honest server-side stats (Session 21 R1)", () => {
  it("normalizes a Prisma aggregate into the stat-card shape", () => {
    const s = statsFromAggregate(412, 266, 176_100, 7_800.4, 95.16);
    expect(s).toEqual({ active: 266, runs: 176_100, hours: 7_800, avgSuccessRate: 95.16 });
  });

  it("maps a null _avg (the empty workspace) to the 100 the client displays", () => {
    const s = statsFromAggregate(0, 0, 0, 0, null);
    expect(s).toEqual({ active: 0, runs: 0, hours: 0, avgSuccessRate: 100 });
  });

  it("rounds hours to the integer the card renders", () => {
    expect(statsFromAggregate(3, 3, 50, 10.6, 99.2).hours).toBe(11);
    expect(statsFromAggregate(3, 3, 50, 10.4, 99.2).hours).toBe(10);
  });
});
