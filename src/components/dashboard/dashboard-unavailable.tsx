import { Home, RefreshCw } from "lucide-react";
import Link from "next/link";

/**
 * The dashboard's server-crash degraded view (Session 19 F2).
 *
 * The S13 branded-boundary goal — "the app loses its identity exactly
 * when the user is already having a bad day" — covered CLIENT-render
 * crashes (error.tsx, pinned by tests/e2e/error-boundary.spec.ts) but
 * never the SERVER half: when the dashboard page's own DB queries fail
 * (a broken volume, an unreachable SQLite file), the standalone server
 * answered Next.js's minimal `__next_error__` document — unbranded,
 * generic, exactly the worst-day scenario the boundary was built for.
 *
 * The page's catch now renders THIS view instead: the error.tsx visual
 * language (dark canvas, rounded-2xl card, white-on-black), a
 * role="alert" region (the S14 status-message discipline — a
 * screen-reader user hears what happened, not silence), a Reload link
 * (a plain anchor re-request — no client JS needed) and a Go-to-home
 * escape. A server component by design: the degraded state must render
 * with zero hydration requirements.
 *
 * The status stays 200 (the S18 health-probe pattern): the page ANSWERED
 * — with an honest degraded state, not a crash. The DB-down alerting
 * signal is /api/health's `db` field (D87); the UI degrades gracefully
 * (ADR-004's degrade-not-fail, extended from the API layer to the page
 * layer).
 */
export function DashboardUnavailable() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div
        role="alert"
        className="max-w-md w-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10 text-center space-y-6"
      >
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold text-white">
            Workspace unavailable
          </h1>
          <p className="text-sm text-white/60 font-body leading-relaxed">
            We couldn&apos;t reach your workspace data right now. Your data is
            safe — try again in a moment, or head back home.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white text-black rounded-full hover:bg-white/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white border border-white/15 hover:border-white/30 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Home className="w-4 h-4" />
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
