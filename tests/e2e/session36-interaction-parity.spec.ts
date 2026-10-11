import { test, expect } from "@playwright/test";

/**
 * Session 36 — the interaction-surface parity pins (the battery's
 * eleventh surface, first-run findings D134/D135).
 *
 * The hover twin's first run caught the clone's v4-default tokens
 * slate-50 and gray-200 (the "exact matches left on v4 defaults" set
 * from Session 9) serializing their computed values as lab(...) where
 * the live ships rgb(...) — probed IN VIVO, the VALUES are
 * rendering-identical (maxDelta=0 through the lab->sRGB conversion),
 * but the spelling drifts. The Session-9 slate-200 precedent governs:
 * a value-identical token gets PINNED to the v3 hex so the computed
 * serialization is byte-stable (the element renders the live's rgb
 * string, not a lab() spelling) — and the pin holds the byte-stability
 * the same way palette-parity.spec.ts holds the Google border's.
 *
 * The hover pins ride REAL pointer events (gotcha 16: an agent-browser
 * "mouse move" once reported :hover matching while no utility applied
 * — only Playwright's page.mouse.move is trustworthy) and the
 * stable-poll read (the S11 settled-value lesson: poll until two
 * consecutive samples agree; never trust one mid-transition sample).
 */
test("the features AI-chip's gray-200 border serializes the live's rgb string (D134)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900); // the hero entrances settle
  const border = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").includes("AI Intelligence"),
    );
    return el ? getComputedStyle(el).borderTopColor : "NOT FOUND";
  });
  // the live's zinc/gray-200: #e5e7eb — byte-stable, never a lab() spelling
  expect(border).toBe("rgb(229, 231, 235)");
});

test("the login Google button's hover bg renders the live's #f8fafc under a REAL pointer hover (D135)", async ({ page }) => {
  await page.goto("/login");
  const box = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").includes("Google"),
    );
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x, box!.y);
  // the stable-poll read: two consecutive equal samples or the 700ms cap
  const bg = await page.evaluate(async () => {
    const el = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").includes("Google"),
    )!;
    const read = () => getComputedStyle(el).backgroundColor;
    let prev = read();
    for (let i = 0; i < 14; i++) {
      await new Promise((r) => setTimeout(r, 50));
      const cur = read();
      if (cur === prev) return cur;
      prev = cur;
    }
    return prev;
  });
  // the live's hover slate-50: #f8fafc — byte-stable, never a lab() spelling
  expect(bg).toBe("rgb(248, 250, 252)");
});

test("the 404 Go Home button's hover bg renders the live's #f8fafc (D135 twin)", async ({ page }) => {
  await page.goto("/does-not-exist-404");
  const box = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("a, button")).find((b) =>
      (b.textContent || "").includes("Go Home"),
    );
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x, box!.y);
  const bg = await page.evaluate(async () => {
    const el = Array.from(document.querySelectorAll("a, button")).find((b) =>
      (b.textContent || "").includes("Go Home"),
    )!;
    const read = () => getComputedStyle(el).backgroundColor;
    let prev = read();
    for (let i = 0; i < 14; i++) {
      await new Promise((r) => setTimeout(r, 50));
      const cur = read();
      if (cur === prev) return cur;
      prev = cur;
    }
    return prev;
  });
  expect(bg).toBe("rgb(248, 250, 252)");
});

test("the Google button's hover border tracks the live's slate-300 (the hover twin's sibling carrier)", async ({ page }) => {
  await page.goto("/login");
  const box = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").includes("Google"),
    );
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x, box!.y);
  const border = await page.evaluate(async () => {
    const el = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").includes("Google"),
    )!;
    const read = () => getComputedStyle(el).borderTopColor;
    let prev = read();
    for (let i = 0; i < 14; i++) {
      await new Promise((r) => setTimeout(r, 50));
      const cur = read();
      if (cur === prev) return cur;
      prev = cur;
    }
    return prev;
  });
  // the live's hover:border-slate-300: #cbd5e1 — already hex-pinned (S9),
  // this pin holds the hover-STATE carrier the rest-state pin never covered
  expect(border).toBe("rgb(203, 213, 225)");
});

test("the features chip-row's gray-100 bg serializes the live's rgb string (D136 — the anchor-invisible carrier)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const H = document.body.scrollHeight;
    for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 250));
  });
  const bg = await page.evaluate(() => {
    const el = document.querySelector(".bg-gray-100");
    return el ? getComputedStyle(el).backgroundColor : "NOT FOUND";
  });
  // the live's gray-100: #f3f4f6 — a painted STRUCTURAL wrapper no battery
  // anchor measures (not text-bearing, not a media-leaf); found by directed
  // grep + in-vivo probe, pinned for the same byte-stability (D136)
  expect(bg).toBe("rgb(243, 244, 246)");
});
