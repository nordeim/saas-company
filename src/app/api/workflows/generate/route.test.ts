import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Session 34 R2d — the generate route's REAL-SDK OUTPUT PATH, pinned at the
 * route boundary with a mocked SDK (the session_66 S34 candidate 3: the
 * sanitize-clamp behavior under a live LLM response; only the template
 * fallback was pinned before — the fence-strip/parse/sanitize chain lived
 * inline, invisible to every pin).
 *
 * The mock set is the minimum to reach the SDK branch: the SDK module
 * itself (the route imports it DYNAMICALLY — vi.mock's hoisting covers
 * dynamic imports), the session guard (the route under test is the output
 * path, not the auth gate), and the per-user limiter (the bucket would
 * trip across the file's own tests). Everything else — the envelope
 * wrapper, the body ceiling, the method guards — is the REAL
 * implementation (the anti-tautology law: pin the seam against the real
 * surroundings, mock only the external service the S15/S33 discipline
 * keeps out of the gate).
 */

const createCompletion = vi.fn();

vi.mock("z-ai-web-dev-sdk", () => ({
  default: {
    create: async () => ({
      chat: { completions: { create: createCompletion } },
    }),
  },
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    requireSession: async () => ({
      user: { id: "route-test-user", email: "route@test", name: "Route Test" },
    }),
  };
});

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    generateRateLimit: () => ({ allowed: true, retryAfterSec: 0 }),
  };
});

import { POST } from "./route";
import { GENERATE_SYSTEM_PROMPT } from "@/lib/workflow";

const REQ = (idea: string) =>
  new Request("http://localhost/api/workflows/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idea }),
  });

const reply = (content: string) =>
  Promise.resolve({ choices: [{ message: { content } }] });

beforeEach(() => {
  createCompletion.mockReset();
});

describe("POST /api/workflows/generate — the real-SDK output path (Session 34)", () => {
  it("rides a fenced LLM response through the sanitizer into the envelope", async () => {
    createCompletion.mockImplementation(() =>
      reply(
        '```json\n{"name":"Lead enrichment","description":"Enriches inbound leads and scores them for sales.","category":"Sales"}\n```',
      ),
    );
    const res = await POST(REQ("enrich leads"));
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({
      name: "Lead enrichment",
      description: "Enriches inbound leads and scores them for sales.",
      category: "Sales",
    });
  });

  it("CLAMPS a live LLM's over-long output before it reaches the envelope (name 120, description 500)", async () => {
    createCompletion.mockImplementation(() =>
      reply(
        JSON.stringify({
          name: "L".repeat(300),
          description: "D".repeat(800),
          category: "Support",
        }),
      ),
    );
    const res = await POST(REQ("long output"));
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.name.length).toBe(120);
    expect(body.data.description.length).toBe(500);
    expect(body.data.category).toBe("Support");
  });

  it("degrades to the deterministic template when the LLM answers prose (the catch's failure class)", async () => {
    createCompletion.mockImplementation(() => reply("Sure! Here is your workflow:"));
    const res = await POST(REQ("marketing digest"));
    const body = await res.json();
    expect(body.ok).toBe(true);
    // the template's own shape (capitalized idea + the template description)
    expect(body.data.name).toBe("Marketing digest");
    expect(body.data.category).toBe("Marketing");
    expect(body.data.description).toContain("Automation pipeline");
  });

  it("degrades to the template when the completion carries no choices (the empty-output path)", async () => {
    createCompletion.mockImplementation(() => Promise.resolve({ choices: [] }));
    const res = await POST(REQ("sync invoices"));
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.name).toBe("Sync invoices");
    expect(body.data.description).toContain("Automation pipeline");
  });

  it("degrades to the template when the LLM's valid JSON fails sanitization ({} — no name)", async () => {
    createCompletion.mockImplementation(() => reply("{}"));
    const res = await POST(REQ("ops rotation"));
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.name).toBe("Ops rotation");
    expect(body.data.category).toBe("Ops");
  });

  it("sends the VERSIONED GENERATE_SYSTEM_PROMPT on the wire (the Session-36 route-boundary pin — a re-inlined or drifted prompt string fails here, not silently)", async () => {
    // Session 36 R3: the S35 seam is unit-pinned for text + invariant,
    // but nothing pinned that the WIRE carries the constant — the mocked
    // SDK asserts outputs only. This pin reads what createCompletion
    // RECEIVED and holds it to the imported seam constant (the same
    // source the route imports — one source, no second text; a
    // re-inlined route string or an edited constant both fail here).
    createCompletion.mockImplementation(() => reply("{}"));
    await POST(REQ("prompt pin"));
    expect(createCompletion).toHaveBeenCalledTimes(1);
    const call = createCompletion.mock.calls[0][0] as {
      messages: Array<{ role: string; content: string }>;
    };
    const system = call.messages.find((m) => m.role === "system");
    expect(system?.content).toBe(GENERATE_SYSTEM_PROMPT);
  });
});
