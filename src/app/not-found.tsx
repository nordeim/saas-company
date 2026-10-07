"use client";

import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

/** 404 — the reference's slate-50 centered card with the Go Home button.
 * The sentence quotes the missing pathname in a medium-weight slate span
 * (measured from the live: `The page "xyz" could not be found…`).
 *
 * Session 11 F2: this route is STATICALLY PRERENDERED, so the server HTML
 * ships the pathname span EMPTY (no concrete route exists at build time).
 * Rendering route state directly made the hydration text mismatch (React
 * #418 on every unknown route). Two traps shape the implementation:
 * `usePathname()` returns the INTERNAL route id `/_not-found` once the
 * App Router settles (the real URL only exists during the hydration
 * render), so the span reads `window.location.pathname` — the
 * authoritative browser URL — behind a useSyncExternalStore mount gate
 * (server snapshot false, client snapshot true): server and hydration
 * renders agree (empty quotes), and the real path fills in one
 * post-hydration commit and STAYS (location is immutable on a terminal
 * 404 view). Pinned by tests/e2e/hydration.spec.ts. */
const emptySubscribe = () => () => {};
const getMounted = () => true;
const getServerMounted = () => false;

export default function NotFound() {
  const router = useRouter();
  const mounted = useSyncExternalStore(emptySubscribe, getMounted, getServerMounted);
  const quoted = `"${mounted ? window.location.pathname.replace(/^\//, "") : ""}"`;
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-slate-300">404</h1>
            <div className="h-0.5 w-16 bg-slate-200 mx-auto" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
            <p className="text-slate-600 leading-relaxed">
              The page{" "}
              <span className="font-medium text-slate-700">{quoted}</span>{" "}
              could not be found in this application.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
