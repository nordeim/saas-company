"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function DashboardApp({
  user,
  initialWorkflows,
}: {
  user: { id: string; email: string; name: string };
  initialWorkflows: WorkflowRow[];
}) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowRow[]>(initialWorkflows);
  const [idea, setIdea] = useState("");
  const [composing, setComposing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const active = workflows.filter((w) => w.status === "active");
    const runs = workflows.reduce((n, w) => n + w.runs, 0);
    const hours = workflows.reduce((n, w) => n + w.timeSavedHours, 0);
    const avgRate = workflows.length
      ? workflows.reduce((n, w) => n + w.successRate, 0) / workflows.length
      : 100;
    return { active: active.length, runs, hours: Math.round(hours), avgRate: avgRate.toFixed(1) };
  }, [workflows]);

  const maxRuns = Math.max(1, ...workflows.map((w) => w.runs));

  async function refresh() {
    const res = await fetch("/api/workflows");
    const payload = await res.json().catch(() => null);
    if (res.ok && payload?.ok) setWorkflows(payload.data);
  }

  async function compose(e: React.FormEvent) {
    e.preventDefault();
    if (composing || !idea.trim()) return;
    setComposing(true);
    setError("");
    try {
      // 1) Ask the AI composer (falls back to the deterministic template).
      const genRes = await fetch("/api/workflows/generate", {
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
      const createRes = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!createRes.ok) throw new Error("create failed");
      setIdea("");
      await refresh();
    } catch {
      setError("Could not compose that workflow. Try again.");
    } finally {
      setComposing(false);
    }
  }

  async function toggleStatus(w: WorkflowRow) {
    setBusyId(w.id);
    try {
      await fetch(`/api/workflows/${w.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: w.status === "active" ? "paused" : "active" }),
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(w: WorkflowRow) {
    setBusyId(w.id);
    try {
      await fetch(`/api/workflows/${w.id}`, { method: "DELETE" });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="NovaAI home">
              <LogoWordmark className="text-white" />
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-sm text-white/60 font-body tracking-wide">Dashboard</span>
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
              <span className="text-xs text-white/40 font-body">{workflows.length} total</span>
            </div>

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
                          <span className="text-[10px] text-white/40 font-body uppercase tracking-wider">
                            {w.category}
                          </span>
                        )}
                      </div>
                      {w.description && (
                        <p className="text-sm text-white/50 font-body mt-1.5 leading-relaxed line-clamp-2">
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
                  <div className="flex items-center gap-6 text-xs text-white/40 font-body">
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
              <p className="text-sm text-white/40 font-body">No data yet.</p>
            ) : (
              <div className="space-y-4">
                {workflows.slice(0, 8).map((w) => (
                  <div key={w.id}>
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
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
