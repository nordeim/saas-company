import { describe, expect, it } from "vitest";
import { MAX_WORKFLOW_LIST, statsFromAggregate, weightedSuccessRate } from "./workflow";

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

describe("statsFromAggregate — the honest server-side stats (Session 21 R1; Session 27 R1 — the rate field carries the run-weighted truth)", () => {
  it("normalizes a Prisma aggregate into the stat-card shape", () => {
    const s = statsFromAggregate(412, 266, 176_100, 7_800.4, 95.16);
    expect(s).toEqual({ active: 266, runs: 176_100, hours: 7_800, successRate: 95.16 });
  });

  it("maps a null rate (the zero-run workspace) to the 100 the client displays", () => {
    const s = statsFromAggregate(0, 0, 0, 0, null);
    expect(s).toEqual({ active: 0, runs: 0, hours: 0, successRate: 100 });
  });

  it("rounds hours to the integer the card renders", () => {
    expect(statsFromAggregate(3, 3, 50, 10.6, 99.2).hours).toBe(11);
    expect(statsFromAggregate(3, 3, 50, 10.4, 99.2).hours).toBe(10);
  });
});

/**
 * Session 27 R1 — the run-weighted success rate (D108): the stat card
 * labeled "Success rate" must carry the WORKSPACE's truth — the share of
 * runs that succeeded, Σ(runs × successRate) / Σ(runs) — never the
 * unweighted mean over workflows (the "average of averages" fallacy:
 * probed RED with 1 row of 12,000 runs @ 60% + 4 rows of 3 runs @ 100%,
 * the unweighted mean displays 92.0% while the workspace's true rate is
 * 60.0% — a 32-point divergence displayed beside "Total runs 12,012").
 */
describe("weightedSuccessRate — the workspace's run-weighted truth (Session 27 R1)", () => {
  it("weights by runs: the extreme shape (12,000 @ 60% + 4 × 3 @ 100%) answers 60.04, not the 92.0 unweighted mean", () => {
    const rows = [
      { runs: 12_000, successRate: 60 },
      ...Array.from({ length: 4 }, () => ({ runs: 3, successRate: 100 })),
    ];
    expect(weightedSuccessRate(rows)).toBeCloseTo(721_200 / 12_012, 6);
  });

  it("is null for the empty workspace (no rows)", () => {
    expect(weightedSuccessRate([])).toBeNull();
  });

  it("is null when every row has zero runs (no sample to weight)", () => {
    expect(weightedSuccessRate([
      { runs: 0, successRate: 100 },
      { runs: 0, successRate: 50 },
    ])).toBeNull();
  });

  it("a single row answers its own rate", () => {
    expect(weightedSuccessRate([{ runs: 7_120, successRate: 99.5 }])).toBeCloseTo(99.5, 6);
  });

  it("equal run counts reduce to the plain mean", () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({ runs: 100, successRate: 90 + i }));
    expect(weightedSuccessRate(rows)).toBeCloseTo(92.5, 6);
  });

  it("the seeded 6-row workspace answers the run-weighted truth (99.488…, not the 99.167 unweighted mean)", () => {
    const seeded = [
      { runs: 1_284, successRate: 99.7 },
      { runs: 148, successRate: 100 },
      { runs: 3_422, successRate: 99.2 },
      { runs: 96, successRate: 98.4 },
      { runs: 63, successRate: 97.8 },
      { runs: 2_107, successRate: 99.9 },
    ];
    expect(weightedSuccessRate(seeded)).toBeCloseTo(708_374.3 / 7_120, 4);
  });
});
