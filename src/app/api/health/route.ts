import { ok } from "@/lib/api";

/** Liveness probe. */
export async function GET() {
  return ok({ status: "ok", app: "saas-company", ts: new Date().toISOString() });
}
