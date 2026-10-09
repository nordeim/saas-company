import { describe, expect, it } from "vitest";
import { MAX_WORKFLOW_LIST, statsFromAggregate, sumHours, weightedSuccessRate } from "./workflow";

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

  it("rounds the x.5 boundary HALF-UP — the nearest-integer convention at the exact tie (Session 28 R1)", () => {
    // The S53 candidate surface: a workspace whose true decimal hours sum
    // sits exactly on x.5. The convention (Math.round) rounds half toward
    // +Infinity — 48.5 renders 49, 53.5 renders 54. The pins exist so the
    // boundary can never silently become truncation or banker's drift.
    expect(statsFromAggregate(3, 3, 50, 48.5, 99.2).hours).toBe(49);
    expect(statsFromAggregate(3, 3, 50, 53.5, 99.2).hours).toBe(54);
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

/**
 * Session 28 R1 — the exact hours seam (D110): the "Hours saved" card's
 * HOURS must come from ONE order-free definition. Probed RED at the seam
 * level: the client's listStats fallback summed timeSavedHours with a
 * naive JS float reduce — order-dependent at exactly-x.5 decimal shapes
 * ([15.4, 17.9, 15.2] is 48.5 in decimal but 48.499999999999993 in the
 * list's addition order — displaying 48 where the server's SQLite SUM,
 * extended-precision, answers 48.5 and displays 49). The seam accumulates
 * INTEGER TENTHS (associative — order-free by construction) and answers
 * the exact decimal-grid sum; every persisted timeSavedHours value is on
 * the 0.1 grid (POST hardcodes 0; PATCH never writes hours), so the grid
 * snap is exact for every reachable workspace state.
 */
describe("sumHours — the exact decimal-grid hours sum (Session 28 R1)", () => {
  it("answers the DRIFT shape's decimal truth exactly (48.5, not the 48.499999999999993 a naive float reduce yields in list order)", () => {
    const rows = [{ timeSavedHours: 15.2 }, { timeSavedHours: 17.9 }, { timeSavedHours: 15.4 }];
    // The discriminating assertion: the naive reduce over THIS order
    // answers 48.499999999999993 (Math.round → 48); the seam must answer
    // the exact grid value 48.5 (Math.round → 49, the half-up convention).
    const naive = rows.reduce((n, r) => n + r.timeSavedHours, 0);
    expect(naive).toBeLessThan(48.5); // the bug the seam exists to close
    expect(sumHours(rows)).toBe(48.5);
  });

  it("is ORDER-FREE — the same shape in any addition order answers identically", () => {
    const shape = [23.4, 15.7, 14.4];
    const perms = [
      shape,
      [...shape].reverse(),
      [shape[1], shape[2], shape[0]],
      [shape[2], shape[0], shape[1]],
    ];
    const answers = new Set(perms.map((p) => sumHours(p.map((h) => ({ timeSavedHours: h })))));
    expect(answers.size).toBe(1);
    expect([...answers][0]).toBe(53.5);
  });

  it("the seeded 6-row workspace answers exactly 160", () => {
    const seeded = [41.5, 12, 26, 33, 18.5, 29].map((h) => ({ timeSavedHours: h }));
    expect(sumHours(seeded)).toBe(160);
  });

  it("the empty workspace answers 0", () => {
    expect(sumHours([])).toBe(0);
  });

  it("the exact-halves control stays exact (23.5 — Math.round renders 24)", () => {
    expect(sumHours([{ timeSavedHours: 10.5 }, { timeSavedHours: 13 }])).toBe(23.5);
  });
});
