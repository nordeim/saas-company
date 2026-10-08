"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Reveal } from "@/components/site/reveal";

/**
 * The Book-a-Demo view — the front half of the demo-request superset
 * (Session 14 F1). `POST /api/demo` shipped complete (validation + rate
 * limit + the DemoRequest model) but with zero UI consumers; this route
 * makes the feature reachable. Pure superset surface (the live 404s
 * /demo — its SPA shell; verified by the Session-14 probe), so the design
 * follows the codebase's own content-page pattern (the FAQ view): dark
 * brand, Navbar + Footer, Reveal entrances.
 *
 * The form mirrors the API's own contract (src/app/api/demo/route.ts):
 * name required ≤80, email required + valid, company ≤120, message ≤2000
 * — and upholds the composer contract (Session 12): every failure class
 * surfaces a role="alert" banner (API rejection, rate limit, network
 * fault — zero uncaught rejections); success confirms through a polite
 * role="status" live region (WCAG 4.1.3).
 */

const INPUT =
  "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors font-body";

export function DemoView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, message }),
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload?.ok) {
        setDone(true);
        setName("");
        setEmail("");
        setCompany("");
        setMessage("");
      } else {
        setError(payload?.error?.message ?? "Something went wrong. Try again.");
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <Reveal as="div" className="max-w-2xl mx-auto" y={20} duration={600} mode="mount">
          <div className="text-center mb-12">
            <span className="text-xs tracking-widest uppercase text-violet font-body mb-4 block">
              Demo
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Book a Demo
            </h1>
            <p className="text-white/50 font-body text-lg">
              See NovaAI on your own workflows. Tell us a little about your
              team and we&apos;ll walk you through it.
            </p>
          </div>

          <div className="border border-white/15 rounded-2xl bg-white/[0.02] p-6 md:p-10">
            {/* The Session-15 F2 outline fix: the page's only heading was the
                h1, so the byte-pinned footer's first h3 landed after it with
                no intervening h2 (a heading-order violation on a SUPERSET
                route — D63 parity adjudication covers live-mirrored routes
                only). An sr-only h2 opens the form card: the outline reads
                h1 → h2 → footer h3s with zero visual delta. */}
            <h2 className="sr-only">Request a demo</h2>
            {done ? (
              <div
                role="status"
                aria-live="polite"
                className="border border-green-400/30 bg-green-400/10 rounded-xl p-6 text-center"
              >
                <CalendarClock className="w-8 h-8 mx-auto text-green-400 mb-3" aria-hidden="true" />
                <p className="text-white font-body font-medium">
                  Thanks — your demo request was received.
                </p>
                <p className="text-white/60 font-body text-sm mt-2">
                  We&apos;ll reach out within one business day to schedule
                  your walkthrough.
                </p>
                <button
                  type="button"
                  onClick={() => setDone(false)}
                  className="mt-6 text-sm text-violet hover:text-white transition-colors font-body"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="demo-name" className="block text-sm font-medium text-white/80 font-body mb-2">
                    Name
                  </label>
                  <input
                    id="demo-name"
                    name="name"
                    type="text"
                    required
                    maxLength={80}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="demo-email" className="block text-sm font-medium text-white/80 font-body mb-2">
                    Email
                  </label>
                  <input
                    id="demo-email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="demo-company" className="block text-sm font-medium text-white/80 font-body mb-2">
                    Company (optional)
                  </label>
                  <input
                    id="demo-company"
                    name="company"
                    type="text"
                    maxLength={120}
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="demo-message" className="block text-sm font-medium text-white/80 font-body mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    id="demo-message"
                    name="message"
                    rows={4}
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What would you like to automate first?"
                    className={`${INPUT} resize-y`}
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-400 font-body border border-red-400/30 bg-red-400/10 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-white/90 transition-all duration-300 font-body disabled:opacity-50 disabled:pointer-events-none"
                >
                  {busy ? "Sending…" : "Request a demo"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
