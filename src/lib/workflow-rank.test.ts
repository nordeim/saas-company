import { describe, expect, it } from "vitest";

/**
 * Session 26 R1a — the chart's ranking seam (`rankByRuns`, the pure
 * client-side FALLBACK for the meta-less contract — the e2e
 * error-boundary mocks fulfill with bare arrays and must keep working).
 *
 * The defect this seam exists to close (probed RED on :3190 /
 * db/probe-s26.db, gotcha-30): the runs chart under the heading "Runs by
 * workflow" charted the 8 most RECENT rows (mirroring the list) — a
 * 12-row workspace whose OLDEST row carried 12,000 runs rendered 8 stub
 * bars (4%–7.5% of a max the chart never displayed) with the champion
 * INVISIBLE. The heading's promise governs: a ranking surface ranks by
 * its metric. The SERVER carries the true top-8 (meta.topRuns — honest
 * at any volume, the S21 stat-cards precedent); this seam is the
 * client-side fallback for meta-less payloads (few rows — the mock
 * contract), pinning the same ordering contract: runs DESC, ties broken
 * by createdAt DESC (the list's own newest-first convention).
 */
import { CHART_ROWS, rankByRuns } from "./workflow";

type Row = { id: string; name: string; runs: number; createdAt: string };

const row = (id: string, name: string, runs: number, createdAt: string): Row => ({
  id,
  name,
  runs,
  createdAt,
});

describe("rankByRuns() — the chart's ordering seam (Session 26 R1)", () => {
  it("ranks by runs descending — the champion charts FIRST even when it is the OLDEST row", () => {
    const rows = [
      row("1", "Recent Sixteen", 150, "2026-10-09T00:00:00Z"),
      row("2", "Recent Fifteen", 300, "2026-10-08T00:00:00Z"),
      row("3", "Ancient Champion", 12000, "2026-08-10T00:00:00Z"),
      row("4", "Old Runner", 9000, "2026-08-15T00:00:00Z"),
    ];
    const ranked = rankByRuns(rows, CHART_ROWS);
    expect(ranked[0].name).toBe("Ancient Champion");
    expect(ranked.map((r) => r.runs)).toEqual([12000, 9000, 300, 150]);
  });

  it("breaks ties by createdAt descending — newest first among equals (the list's own convention)", () => {
    const rows = [
      row("1", "Older tie", 10, "2026-10-01T00:00:00Z"),
      row("2", "Newest tie", 10, "2026-10-09T00:00:00Z"),
      row("3", "Mid tie", 10, "2026-10-05T00:00:00Z"),
      row("4", "Above the ties", 11, "2026-01-01T00:00:00Z"),
    ];
    const ranked = rankByRuns(rows, CHART_ROWS);
    expect(ranked[0].name).toBe("Above the ties");
    expect(ranked.slice(1).map((r) => r.name)).toEqual(["Newest tie", "Mid tie", "Older tie"]);
  });

  it("caps at the limit — a >8 workspace yields exactly CHART_ROWS rows, the LOWEST runs dropped first", () => {
    const rows = Array.from({ length: 12 }, (_, i) =>
      row(String(i), `Row ${i + 1}`, (i + 1) * 100, `2026-09-${String(i + 1).padStart(2, "0")}T00:00:00Z`),
    );
    const ranked = rankByRuns(rows, CHART_ROWS);
    expect(ranked).toHaveLength(CHART_ROWS);
    // The 8 HIGHEST runs survive (rows 12..5), the 4 lowest (rows 1..4) drop.
    expect(ranked.map((r) => r.runs)).toEqual([1200, 1100, 1000, 900, 800, 700, 600, 500]);
  });

  it("returns an empty array for an empty workspace (the chart's 'No data yet.' branch)", () => {
    expect(rankByRuns([], CHART_ROWS)).toEqual([]);
  });

  it("does not mutate its input (the list keeps its own recency order — the two surfaces stay independent)", () => {
    const rows = [
      row("1", "Recent", 5, "2026-10-09T00:00:00Z"),
      row("2", "Ancient", 9000, "2026-01-01T00:00:00Z"),
    ];
    const snapshot = [...rows];
    rankByRuns(rows, CHART_ROWS);
    expect(rows).toEqual(snapshot);
  });

  it("CHART_ROWS is 8 — the chart's ceiling (the S25 constant, now shared by the server loaders and the client)", () => {
    expect(CHART_ROWS).toBe(8);
  });
});
