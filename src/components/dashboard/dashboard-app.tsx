"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WorkflowStats } from "@/lib/workflow";
import {
  Activity,
  Check,
  Clock,
  Loader2,
  LogOut,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Workflow as WorkflowIcon,
  Zap,
} from "lucide-react";
import { LogoWordmark } from "@/components/site/logo";
import { fetchWithTimeout } from "@/lib/client-fetch";

/**
 * The NovaAI workspace (functional superset over the reference, whose
 * "Dashboard" demo link 404s): stats, an AI workflow composer, the workflow
 * list with pause/resume/delete, and a runs chart — all persisted through
 * the /api/workflows routes.
 */

export interface WorkflowRow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  category: string | null;
  runs: number;
  successRate: number;
  timeSavedHours: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/** Session 13 F1: the 401 sentinel — thrown by apiFetch, caught by the
 * existing catch blocks so no unhandled rejection escapes (the redirect
 * is the feedback; the banner never renders for 401s — Session 23 R1.3
 * makes that contract exact with an instanceof early-return in every
 * catch). */
class SessionExpired {}

/** Session 25 R1/R2: the runs-chart row ceiling — the single source for
 * the chart's slice, its honest truncation note, and (indirectly) the
 * e2e pins (`session25-chart.spec.ts`). When the workspace holds more
 * workflows than this, the chart SAYS so (the S21 law: a ceiling that
 * lies is worse than no ceiling). */
const CHART_ROWS = 8;

export function DashboardApp({
  user,
  initialWorkflows,
  totalWorkflows,
  initialStats,
}: {
  user: { id: string; email: string; name: string };
  initialWorkflows: WorkflowRow[];
  /** Session 21 R1: the TRUE workflow count (the list may be capped at
   *  MAX_WORKFLOW_LIST — the header counter must never read the fetched
   *  length when the workspace is larger). */
  totalWorkflows: number;
  /** Session 21 R1: the server-side aggregates — TRUE at any volume from
   *  the first paint (a capped list without honest aggregates would turn
   *  the stat cards into subset summaries). */
  initialStats: WorkflowStats;
}) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowRow[]>(initialWorkflows);
  const [total, setTotal] = useState(totalWorkflows);
  const [serverStats, setServerStats] = useState<WorkflowStats | null>(initialStats);
  const [idea, setIdea] = useState("");
  const [composing, setComposing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  // Session 12 F3: the action-failure banner — visible from every scroll
  // position (the composer's own error lives inside the composer card,
  // invisible to a user working the workflow list below). Same contract
  // as compose()'s setError: surface, never swallow.
  const [actionError, setActionError] = useState("");
  // Session 14 F3: the success-class mirror of that banner — a polite
  // screen-reader live region (WCAG 4.1.3 Status Messages). Errors alert
  // (role="alert", assertive by convention); successes confirm politely.
  // Without it a paused/deleted/composed workflow changed the stats in
  // silence for a screen-reader user — the action landed but nothing
  // announced it.
  const [announce, setAnnounce] = useState("");
  // Session 23 R2: the refresh() sequence source (see refresh).
  const refreshSeq = useRef(0);

  // Session 21 R1: the stat cards read the SERVER aggregates when
  // available (TRUE at any volume — a capped list must never turn the
  // cards into subset summaries); the list-derived memo below remains
  // the FALLBACK for meta-less payloads (the e2e error-boundary mocks
  // fulfill with bare arrays). The shapes agree exactly at <= 100 rows
  // (the common case — the memo and the aggregate walk the same rows).
  const listStats = useMemo(() => {
    const active = workflows.filter((w) => w.status === "active");
    const runs = workflows.reduce((n, w) => n + w.runs, 0);
    const hours = workflows.reduce((n, w) => n + w.timeSavedHours, 0);
    const avgRate = workflows.length
      ? workflows.reduce((n, w) => n + w.successRate, 0) / workflows.length
      : 100;
    return { active: active.length, runs, hours: Math.round(hours), avgRate: avgRate.toFixed(1) };
  }, [workflows]);
  const stats = serverStats
    ? {
        active: serverStats.active,
        runs: serverStats.runs,
        hours: serverStats.hours,
        avgRate: serverStats.avgSuccessRate.toFixed(1),
      }
    : listStats;

  const maxRuns = Math.max(1, ...workflows.map((w) => w.runs));

  // Session 13 F1: a 401 is NOT a network fault — retrying will 401
  // forever. "Try again" would lie; the honest contract is the server
  // gate's (page.tsx:14): go re-authenticate.
  // Session 24 R1: every fetch rides the client timeout — a black-holed
  // request (the CLIENT twin of S15's server-side hang) rejects at the
  // 20s ceiling into the existing network-fault catches instead of
  // spinning the busy guard forever (probed RED: the spinner was still
  // engaged after 8s with no banner).
  async function apiFetch(input: string, init?: RequestInit) {
    const res = await fetchWithTimeout(input, init);
    if (res.status === 401) {
      router.push("/login?from_url=/dashboard");
      throw new SessionExpired();
    }
    return res;
  }

  async function refresh() {
    // Session 23 R2: the in-flight ordering guard. Every refresh takes the
    // next sequence number; a response that was superseded by a NEWER
    // refresh (a slow stale GET landing after a fresh one — probed: the
    // deleted row RESURRECTED when the stale snapshot landed last) is
    // dropped before any setState. The newest server truth always wins.
    const seq = ++refreshSeq.current;
    const res = await apiFetch("/api/workflows");
    const payload = await res.json().catch(() => null);
    if (seq !== refreshSeq.current) return;
    // Session 13 F2: shape-check the envelope — a {ok:true,data:null}
    // response must never reach setWorkflows (the stats memo's .filter
    // would crash the render; the error boundary is the net, this is
    // the guard).
    if (res.ok && payload?.ok && Array.isArray(payload.data)) setWorkflows(payload.data);
    // Session 21 R1: consume the meta sibling when present (the TRUE
    // total + honest server aggregates). Strictly optional — the e2e
    // error-boundary mocks fulfill with bare arrays and keep working
    // through the memo fallback below.
    if (res.ok && payload?.ok && payload.meta && typeof payload.meta === "object") {
      const meta = payload.meta as { total?: unknown; stats?: Partial<WorkflowStats> };
      if (typeof meta.total === "number") setTotal(meta.total);
      if (meta.stats && typeof meta.stats.active === "number" && typeof meta.stats.runs === "number"
        && typeof meta.stats.hours === "number" && typeof meta.stats.avgSuccessRate === "number") {
        setServerStats(meta.stats as WorkflowStats);
      }
    }
  }

  async function compose(e: React.FormEvent) {
    e.preventDefault();
    if (composing || !idea.trim()) return;
    setComposing(true);
    // Session 24 R2: clear BOTH failure surfaces at every action start —
    // a retry invitation must never outlive the context it describes
    // (a stale "Try again." after the network recovered is a lie by
    // staleness; probed RED in both directions).
    setError("");
    setActionError("");
    try {
      // 1) Ask the AI composer (falls back to the deterministic template).
      const genRes = await apiFetch("/api/workflows/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const gen = await genRes.json().catch(() => null);
      const draft =
        genRes.ok && gen?.ok
          ? gen.data
          : { name: idea.trim().slice(0, 120), description: "", category: "Ops" };

      // 2) Persist it.
      const createRes = await apiFetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!createRes.ok) throw new Error("create failed");
      setIdea("");
      await refresh();
      setAnnounce("Workflow created.");
    } catch (e) {
      // Session 23 R1.3: the 401 already redirected — the banner contract
      // belongs to the RETRYABLE classes only.
      if (e instanceof SessionExpired) return;
      setError("Could not compose that workflow. Try again.");
    } finally {
      setComposing(false);
    }
  }

  async function toggleStatus(w: WorkflowRow) {
    setBusyId(w.id);
    // Session 24 R2: both surfaces (see compose).
    setActionError("");
    setError("");
    try {
      // Session 12 F3: the catch contract — network-level failures
      // (fetch rejections) AND HTTP-level failures (!res.ok) surface as
      // the banner instead of an uncaught pageerror with silent staleness.
      // Session 13 F1: 401s route through apiFetch's redirect instead.
      const res = await apiFetch(`/api/workflows/${w.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: w.status === "active" ? "paused" : "active" }),
      });
      if (!res.ok) {
        // Session 23 R1.1: the honest-404 dispatch. S22 closed the server
        // race by construction — a 404 here means the row was deleted out
        // from under this tab (another tab/device). "Try again" would LIE
        // (every retry 404s forever), and the ghost row would linger.
        // Mirror the truth instead: drop the row locally, re-sync with the
        // server, and announce politely — the S14 live region, not the
        // S12 error banner (this is not an error; it is the truth catching
        // up). The S13 401-sentinel's pattern: a failure class that must
        // not wear the retry banner.
        if (res.status === 404) {
          setWorkflows((rows) => rows.filter((r) => r.id !== w.id));
          setTotal((t) => Math.max(0, t - 1));
          await refresh();
          setAnnounce(`${w.name} is no longer in the workspace.`);
          return;
        }
        throw new Error("update failed");
      }
      await refresh();
      setAnnounce(
        w.status === "active" ? `Paused ${w.name}.` : `Resumed ${w.name}.`,
      );
    } catch (e) {
      if (e instanceof SessionExpired) return; // Session 23 R1.3
      setActionError("Could not update that workflow. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(w: WorkflowRow) {
    setBusyId(w.id);
    // Session 24 R2: both surfaces (see compose).
    setActionError("");
    setError("");
    try {
      const res = await apiFetch(`/api/workflows/${w.id}`, { method: "DELETE" });
      if (!res.ok) {
        // Session 23 R1.2: the idempotent-success contract. A 404 means the
        // row is ALREADY gone — which is exactly what Delete asked for.
        // Re-sync with the server and confirm politely; no banner.
        if (res.status === 404) {
          setWorkflows((rows) => rows.filter((r) => r.id !== w.id));
          setTotal((t) => Math.max(0, t - 1));
          await refresh();
          setAnnounce(`${w.name} was already removed.`);
          return;
        }
        throw new Error("delete failed");
      }
      await refresh();
      setAnnounce(`Deleted ${w.name}.`);
    } catch (e) {
      if (e instanceof SessionExpired) return; // Session 23 R1.3
      setActionError("Could not delete that workflow. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function signOut() {
    // Session 24 R2: both surfaces (see compose).
    setActionError("");
    setError("");
    try {
      // Session 24 R1: the timeout rides the logout fetch too — a hung
      // logout POST would otherwise strand the user with no feedback.
      await fetchWithTimeout("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      // The session cookie is still live server-side — navigating away
      // would lie to the user. The banner explains instead.
      setActionError("Could not sign out. Check your connection and try again.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Session 14 F3: the polite success live region (WCAG 4.1.3) —
          visually hidden (sr-only), announced by screen readers. The
          success-class mirror of the role="alert" banners below: errors
          alert, successes confirm politely. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {/* Top bar */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="NovaAI home">
              <LogoWordmark className="text-white" />
            </Link>
            <span className="text-white/20">/</span>
            {/* The page's single h1 (Session 10 F3 — axe page-has-heading-one);
                styled exactly as the breadcrumb span it replaces. */}
            <h1 className="text-sm text-white/60 font-body tracking-wide">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60 font-body hidden sm:inline">{user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white border border-white/15 hover:border-white/30 rounded-full transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Session 12 F3: the action-failure banner — full-width, visible
          from every scroll position, cleared at the start of each action. */}
      {actionError && (
        <div role="alert" className="max-w-7xl mx-auto px-6 pt-6">
          <p className="text-sm text-red-400 font-body">{actionError}</p>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <section aria-label="Workspace stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active workflows", value: stats.active, icon: Zap, tint: "text-violet" },
            { label: "Total runs", value: stats.runs.toLocaleString(), icon: Activity, tint: "text-electric-blue" },
            { label: "Hours saved", value: stats.hours.toLocaleString(), icon: Clock, tint: "text-violet" },
            { label: "Avg success rate", value: `${stats.avgRate}%`, icon: Check, tint: "text-electric-blue" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <s.icon className={`w-5 h-5 ${s.tint}`} />
              </div>
              <div>
                <div className="font-heading text-2xl font-semibold text-white leading-none mb-1">
                  {s.value}
                </div>
                <div className="text-xs text-white/50 font-body uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* AI composer */}
        <section
          aria-label="AI workflow composer"
          className="rounded-2xl border border-violet/40 bg-gradient-to-br from-violet/[0.15] to-electric-blue/[0.10] p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-violet" />
            <h2 className="font-heading text-lg font-semibold text-white">
              Compose a workflow with AI
            </h2>
          </div>
          <p className="text-sm text-white/60 font-body mb-5 max-w-2xl">
            Describe an automation in one line — NovaAI drafts the workflow, picks a category, and
            adds it to your workspace.
          </p>
          <form onSubmit={compose} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. Sync new Stripe invoices to QuickBooks and alert finance on failures"
              aria-label="Workflow idea"
              className="flex-1 px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet/60 transition-colors font-body"
            />
            <button
              type="submit"
              disabled={composing || !idea.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {composing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {composing ? "Composing…" : "Compose"}
            </button>
          </form>
          {error && (
            <p role="alert" className="text-sm text-red-400 mt-3">
              {error}
            </p>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Workflow list */}
          <section aria-label="Workflows" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-white flex items-center gap-2">
                <WorkflowIcon className="w-4 h-4 text-violet" />
                Workflows
              </h2>
              <span className="text-xs text-white/60 font-body">{total} total</span>
            </div>

            {/* Session 21 R1: the honest truncation note — the list is
                capped at MAX_WORKFLOW_LIST (newest first); when the
                workspace is larger, SAY so instead of silently hiding
                the rest (the stats above remain TRUE — they ride the
                server-side aggregate, not this visible subset).
                Session 25: text-white/50 (was /40 — the S10/D59 axe lesson,
                caught live by this session's chart-note scan: white/40
                composites to 3.5:1 on the dark card). */}
            {workflows.length > 0 && workflows.length < total && (
              <p className="text-xs text-white/50 font-body">
                Showing the {workflows.length} most recent of {total} workflows.
              </p>
            )}

            {workflows.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
                <WorkflowIcon className="w-8 h-8 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 font-body text-sm">
                  No workflows yet — compose your first one above.
                </p>
              </div>
            ) : (
              workflows.map((w) => (
                <article
                  key={w.id}
                  className={`rounded-2xl border p-5 transition-colors ${
                    w.status === "active"
                      ? "border-white/15 bg-white/[0.02]"
                      : "border-white/10 bg-white/[0.01] opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-base font-semibold text-white truncate">
                          {w.name}
                        </h3>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            w.status === "active"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : w.status === "paused"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-white/5 text-white/50 border-white/10"
                          }`}
                        >
                          {w.status}
                        </span>
                        {w.category && (
                          <span className="text-[10px] text-white/60 font-body uppercase tracking-wider">
                            {w.category}
                          </span>
                        )}
                      </div>
                      {w.description && (
                        <p className="text-sm text-white/60 font-body mt-1.5 leading-relaxed line-clamp-2">
                          {w.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleStatus(w)}
                        disabled={busyId === w.id}
                        aria-label={w.status === "active" ? `Pause ${w.name}` : `Resume ${w.name}`}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/25 transition-colors disabled:opacity-50"
                      >
                        {busyId === w.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : w.status === "active" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => remove(w)}
                        disabled={busyId === w.id}
                        aria-label={`Delete ${w.name}`}
                        className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400/80 hover:text-red-400 hover:border-red-500/40 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-white/60 font-body">
                    <span>{w.runs.toLocaleString()} runs</span>
                    <span>{w.successRate.toFixed(1)}% success</span>
                    <span>{w.timeSavedHours.toFixed(1)}h saved</span>
                  </div>
                </article>
              ))
            )}
          </section>

          {/* Runs chart */}
          <section aria-label="Runs by workflow" className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="font-heading text-base font-semibold text-white mb-6">Runs by workflow</h2>
            {workflows.length === 0 ? (
              <p className="text-sm text-white/60 font-body">No data yet.</p>
            ) : (
              <div>
                {/* Session 25 R1: the chart's honest truncation note — the
                    S21 "a ceiling that lies is worse than no ceiling" law,
                    found in the chart (probed RED: 12 workflows → 8 bars,
                    silently). The chart caps at CHART_ROWS while the
                    workspace holds more → SAY so, with the TRUE server-side
                    total (the S21 R1 state, not the capped list length).
                    text-white/50 (the S10/D59 axe lesson — white/40 composites
                    to 3.5:1 on the dark card, below the 4.5:1 floor). */}
                {workflows.length > CHART_ROWS && (
                  <p className="text-xs text-white/50 font-body mb-4">
                    Showing the {CHART_ROWS} most recent of {total} workflows.
                  </p>
                )}
                {/* Session 25 R2: a semantic list — a screen reader announces
                    "list, N items" instead of reading div soup (probed: the
                    pre-fix rows were unannounced structure). Preflight resets
                    the list styling: visually identical to the divs it
                    replaces. */}
                <ul className="space-y-4">
                  {workflows.slice(0, CHART_ROWS).map((w) => (
                    <li key={w.id}>
                      <div className="flex justify-between text-xs text-white/50 font-body mb-1.5">
                        <span className="truncate pr-2">{w.name}</span>
                        <span className="flex-shrink-0">{w.runs.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${Math.max(4, (w.runs / maxRuns) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
