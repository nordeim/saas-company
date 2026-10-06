import { ok, fail } from "@/lib/api";
import { requireSession } from "@/lib/api";
import { requiredString } from "@/lib/validation";
import {
  sanitizeGeneratedWorkflow,
  templateWorkflow,
} from "@/lib/workflow";

/**
 * POST /api/workflows/generate — the AI workflow composer (superset).
 *
 * Degrade-not-fail: asks the LLM to turn a one-line idea into a workflow
 * (name/description/category); any SDK failure, malformed output, or
 * short-notice environment falls back to the deterministic template so the
 * feature never hard-fails. Output is clamped by sanitizeGeneratedWorkflow.
 */
export async function POST(request: Request) {
  const guard = await requireSession();
  if (!guard.user) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Expected a JSON body.", 400);
  }
  const idea = requiredString((body as Record<string, unknown>)?.idea, 200, "Idea");
  if (!idea.ok) return fail("VALIDATION", idea.error, 400);

  let generated = templateWorkflow(idea.value);

  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            'You turn one-line automation ideas into workflow definitions. Reply with ONLY minified JSON of shape {"name": string (<= 60 chars), "description": string (one sentence, <= 220 chars), "category": one of "Marketing" | "Sales" | "Engineering" | "Ops" | "Finance" | "Support"}. No prose, no markdown fences.',
        },
        { role: "user", content: idea.value },
      ],
      thinking: { type: "disabled" },
    });
    const text = completion.choices[0]?.message?.content ?? "";
    const jsonText = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const parsed: unknown = JSON.parse(jsonText);
    const sanitized = sanitizeGeneratedWorkflow(parsed, idea.value);
    if (sanitized) generated = sanitized;
  } catch {
    // SDK unavailable or malformed — the deterministic template stands.
  }

  return ok(generated);
}
