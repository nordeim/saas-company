"use client";

import { Home, RotateCcw } from "lucide-react";
import Link from "next/link";

/**
 * The route-segment error boundary (Session 13 F2 — the render-fault
 * superset). Before this shipped, ANY client-side render error (an API
 * row violating the contract, a corrupted payload, version skew) surfaced
 * Next.js's DEFAULT error page — "This page couldn't load" — generic,
 * light, unbranded: the app loses its identity exactly when the user is
 * already having a bad day.
 *
 * The branded contract: the dark canvas, Vend Sans, a role="alert"
 * message, a Try again button (reset() re-renders the segment with the
 * server-provided state) and a Go-to-home escape. The live is an SPA
 * with no equivalent surface (D62/D59: superset, fix and document) —
 * pinned by tests/e2e/error-boundary.spec.ts.
 *
 * Note: the browser's error report for a genuine render fault still logs
 * (inherent, like the 404's document log) — this boundary owns the
 * RECOVERY UI, not console silence.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Surface the digest for support triage without leaking internals to
  // the UI copy.
  console.error("[error-boundary]", error.message, error.digest ?? "");

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div
        role="alert"
        className="max-w-md w-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10 text-center space-y-6"
      >
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-white/60 font-body leading-relaxed">
            This page hit an unexpected error while loading. Your data is safe —
            try again, or head back home.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white text-black rounded-full hover:bg-white/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
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
