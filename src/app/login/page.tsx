"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Mail } from "lucide-react";

type Mode = "signin" | "signup" | "forgot";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/**
 * The reference's shadcn-style alert banner — measured on the live (Session
 * 5): `div[role="alert"]` with the svg-positioning arbitrary variants, a
 * red variant for errors (bg-red-50/70 border-red-200, inner text-red-700)
 * and a green variant for the reset-success notice. Rendered BETWEEN the
 * last field and the submit button (the reference's DOM order).
 */
function AlertBanner({ tone, children }: { tone: "red" | "green"; children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className={`relative w-full border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-foreground rounded-xl ${
        tone === "red" ? "bg-red-50/70 border-red-200" : "bg-green-50/70 border-green-200"
      }`}
    >
      <div className={`[&_p]:leading-relaxed text-sm ${tone === "red" ? "text-red-700" : "text-green-700"}`}>
        {children}
      </div>
    </div>
  );
}

/* The reference's per-mode input class sets (measured Session 5):
   - signin: text-base, h-11 sm:h-12, placeholder:text-slate-600
   - signup: px-3 py-2 (no text-base), h-10 sm:h-11, placeholder:text-slate-400, text-sm sm:text-base
   - forgot: text-base, h-10 sm:h-11, placeholder:text-slate-400
   (focus-visible:ring-ring is INERT on the inputs — their focus:ring-slate-400
   wins the cascade, measured identical both sides — but ACTIVE on the two
   submit buttons: the live's login bundle defines --ring: 240 10% 3.9%, so
   the keyboard-focused Sign in renders a slate-950 ring. Session 8 F5.) */
const SHARED_INPUT =
  "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10";
const INPUT_SIGNIN = `flex w-full border px-3 py-2 text-base ${SHARED_INPUT} h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600`;
const INPUT_SIGNUP = `flex w-full border px-3 py-2 ${SHARED_INPUT} h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400 text-sm sm:text-base`;
const INPUT_FORGOT = `flex w-full border px-3 py-2 text-base ${SHARED_INPUT} h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400`;
const LABEL = "peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700";
const SUBMIT_SIGNIN =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200";
const SUBMIT_COMPACT =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200";
const BACK_TOP =
  "flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors -mb-2";
const BACK_FULL =
  "w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors";

function LoginCard() {
  const router = useRouter();
  const params = useSearchParams();
  const fromUrl = params.get("from_url") || "/dashboard";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // The forgot-success view ("Check your email") — the reference renders it
  // unconditionally after a reset request (no user enumeration).
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");
    if (mode === "forgot") {
      // No mail transport in the self-hosted clone — mirror the reference's
      // unconditional success view (documented deviation: no email is sent).
      setResetEmail(email);
      return;
    }
    if (mode === "signup" && password !== confirm) {
      // The reference's client-side mismatch copy (measured).
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode === "signup" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload?.ok) {
        router.push(fromUrl);
        router.refresh();
      } else {
        setError(payload?.error?.message ?? "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    // Visual parity only — no OAuth credentials in a self-hosted clone
    // (documented deviation, same doctrine as the reference's placeholders).
    setNotice("Google sign-in isn't configured in this self-hosted clone — use email below.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* The reference's login route swaps the BODY theme: its /login loads
          its own css bundle (static/index-*.css) whose :root is the LIGHT
          theme — body bg white, text zinc-950 (hsl 240 10% 3.9%)), font the
          Tailwind default system stack (measured on the live; every dark
          route keeps the global dark body). This route-scoped <style> mirrors
          that swap — including the light --color-* vars the card inherits
          through (text-card-foreground → zinc-950, so typed input text is
          dark and visible) — and unmounts with the page, restoring the dark
          theme on navigation. */}
      <style>{`
        body {
          background-color: #fff;
          color: #09090b;
          font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          --color-background: #ffffff;
          --color-foreground: #09090b;
          --color-card-foreground: #09090b;
          /* The reference's login bundle ships the STANDARD tracking scale
             (its "or" divider computes 0.6px = 0.05em at 12px) while its
             SPA bundle doubles the two widest steps (globals.css @theme,
             Session 7 F1/F2). Pin the standard value back on this route —
             the --tracking-* custom properties inherit, and v4 utilities
             emit letter-spacing: var(--tracking-wider), so this body
             rule covers everything the route renders. */
          --tracking-wider: 0.05em;
        }
        /* The reference's login bundle defines --ring: 240 10% 3.9%
           (slate-950) on :root — the keyboard-focused Sign in button
           renders a slate-950 ring through its focus-visible:ring-ring
           class (emitted in the live's login css; Session 8 F5). */
        :root { --ring: 240 10% 3.9%; }
        /* The SPA bundle's universal base rule tints every outline violet
           (Session 5 F3) — but the reference's LOGIN bundle ships no such
           rule: its login outlines render the UA currentColor (the Sign in
           button's outline computes WHITE there vs violet/50 here).
           Neutralize the inherited global on this route only (revert =
           the UA value), matching the live's login chrome. */
        * { outline-color: revert; }
        /* The dark routes' base layer sets h1-h6 to var(--font-heading)
           (Vend Sans). The reference's login bundle has no such rule —
           its login h1 renders the SYSTEM stack like the body (measured:
           h1 ui-sans-serif…, card 746px). Restore the inheritance on
           this route only. */
        h1, h2, h3, h4, h5, h6 { font-family: inherit; }
        /* The reference's compiled space-y puts the gap on the FOLLOWING
           sibling (v3-style margin-top). Tailwind v4's margin-bottom on the
           preceding sibling is lost on the form's INLINE labels (vertical
           margins don't apply to inline boxes), tightening each label→input
           gap by ~4px. Restore the measured pattern inside this route's
           forms (block children render identically either way). */
        form .space-y-1\\.5 > :not(:last-child) { margin-bottom: 0; }
        form .space-y-1\\.5 > :not(:first-child) { margin-top: 0.375rem; }
        /* The alternate-state stack (back button / h2 / form): same v3-style
           restoration. Critical here because the back button carries the
           reference's -mb-2 — under v4's preceding-sibling margin the -8px
           CANCELS the stack gap entirely (back→h2 gap −8px vs the live's
           +8px = the 16px signup-card delta the VLM caught). These rules
           put the gap on the following siblings and zero the preceding
           margins on all but the FIRST child (so -mb-2 keeps working). */
        .auth-stack > :not(:first-child) { margin-top: 1rem; }
        .auth-stack > :not(:first-child):not(:last-child) { margin-bottom: 0; }
        /* The forgot variant's stack is space-y-4 sm:space-y-6 (measured:
           24px gaps at sm+ on the live) — the signup stack stays 16px. */
        @media (min-width: 640px) {
          .auth-stack-sm6 > :not(:first-child) { margin-top: 1.5rem; }
        }
      `}</style>
      {/* The reference's login shell carries the Vite noscript fallback as a
          direct body child (the only route that does — Session 3 measurement).
          Invisible with JS enabled; closes the /login word-parity gap. */}
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div className="w-full max-w-md">
        <div className="text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          {/* 4px top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
          <div className="p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">

              {resetEmail !== null ? (
                /* ---------- The reference's reset-success view (measured):
                     back-full is NOT here — heading block, green alert,
                     full-width back button, wrapped in space-y-4 sm:space-y-6. */
                <div className="w-full space-y-4 sm:space-y-6">
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Check your email
                      </h2>
                      <p className="text-slate-600 text-sm sm:text-base">
                        We&apos;ve sent password reset instructions to
                        <br />
                        <span className="font-medium text-slate-900">{resetEmail}</span>
                      </p>
                    </div>
                  </div>
                  <AlertBanner tone="green">
                    Please check your email for the password reset link. It may take a few
                    minutes to arrive.
                  </AlertBanner>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(null);
                      setMode("signin");
                      setError("");
                      setNotice("");
                    }}
                    className={BACK_FULL}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </button>
                </div>
              ) : mode === "signin" ? (
                /* ---------- The default sign-in state (verified parity since
                     Session 2; the error banner moved to the reference's
                     position between the fields and the submit in Session 5). */
                <>
                  {/* Logo chip with blurred halo */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
                    <span className="flex shrink-0 overflow-hidden rounded-full relative h-20 w-20 sm:h-24 sm:w-24 shadow-lg ring-4 ring-white/50 group-hover:shadow-xl transition-all duration-300">
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-muted bg-gradient-to-br from-slate-100 to-slate-200 text-xl sm:text-2xl font-bold text-slate-700">
                        S
                      </span>
                    </span>
                  </div>

                  <div className="space-y-2 sm:space-y-3 w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      Welcome to SAAS Company
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base font-medium">
                      Sign in to continue
                    </p>
                  </div>

                  <div className="w-full">
                    {/* Google (parity; degrades to a notice) */}
                    <div className="space-y-3">
                      <button
                        onClick={onGoogle}
                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
                      >
                        <div className="transition-transform duration-200 -ml-4">
                          <GoogleIcon />
                        </div>
                        <span>Continue with Google</span>
                      </button>
                    </div>

                    {/* or divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div
                          data-orientation="horizontal"
                          role="none"
                          className="shrink-0 h-[1px] w-full bg-slate-200"
                        />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-slate-500 font-medium tracking-wider">
                          or
                        </span>
                      </div>
                    </div>

                    <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit}>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-1.5">
                          <label className={LABEL} htmlFor="email">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                              id="email"
                              type="email"
                              required
                              autoComplete="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={INPUT_SIGNIN}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className={LABEL} htmlFor="password">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                              id="password"
                              type="password"
                              required
                              autoComplete="current-password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className={INPUT_SIGNIN}
                            />
                          </div>
                        </div>
                      </div>

                      {/* The reference renders the error banner BETWEEN the
                          password field and the submit button (measured
                          DOM order: Password → alert → Sign in). */}
                      {error && <AlertBanner tone="red">{error}</AlertBanner>}

                      <div className="space-y-3">
                        <button type="submit" disabled={busy} className={SUBMIT_SIGNIN}>
                          Sign in
                        </button>
                        {notice && (
                          <p role="status" className="text-sm text-slate-500 text-center">
                            {notice}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                          <button
                            type="button"
                            onClick={() => {
                              setMode("forgot");
                              setError("");
                              setNotice("");
                            }}
                            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                          >
                            Forgot password?
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMode("signup");
                              setError("");
                              setNotice("");
                            }}
                            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            Need an account?{" "}
                            <span className="font-medium text-slate-700">Sign up</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                /* ---------- The compact alternate states (measured Session
                     5): a top back button (-mb-2), an H2, an optional
                     subtitle (forgot only), and the form — NO logo chip, NO
                     Google, NO OR divider, NO links row. */
                <div className="w-full">
                  <div
                    className={`space-y-4 auth-stack${mode === "forgot" ? " sm:space-y-6 auth-stack-sm6" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setError("");
                        setNotice("");
                      }}
                      className={BACK_TOP}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to sign in
                    </button>

                    {mode === "signup" ? (
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Create your account
                      </h2>
                    ) : (
                      /* The reference wraps the forgot heading + subtitle in
                         a `text-center space-y-2` block (8px gap), directly
                         under the back button in the space-y-4 stack. */
                      <div className="text-center space-y-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                          Reset your password
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base">
                          Enter your email and we&apos;ll send you a link to reset your password
                        </p>
                      </div>
                    )}

                    <form
                      className={mode === "signup" ? "space-y-3 sm:space-y-4" : "space-y-4 sm:space-y-5"}
                      onSubmit={onSubmit}
                    >
                      <div className={mode === "signup" ? "space-y-3" : "space-y-4"}>
                        <div className="space-y-1.5">
                          <label className={LABEL} htmlFor="email">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              id="email"
                              type="email"
                              required
                              autoComplete="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={mode === "signup" ? INPUT_SIGNUP : INPUT_FORGOT}
                            />
                          </div>
                        </div>

                        {mode === "signup" && (
                          <>
                            <div className="space-y-1.5">
                              <label className={LABEL} htmlFor="password">
                                Password
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                  id="password"
                                  type="password"
                                  required
                                  autoComplete="new-password"
                                  placeholder="Min. 8 characters"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className={INPUT_SIGNUP}
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={LABEL} htmlFor="confirmPassword">
                                Confirm Password
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                  id="confirmPassword"
                                  type="password"
                                  required
                                  autoComplete="new-password"
                                  placeholder="Re-enter password"
                                  value={confirm}
                                  onChange={(e) => setConfirm(e.target.value)}
                                  className={INPUT_SIGNUP}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {error && <AlertBanner tone="red">{error}</AlertBanner>}

                      <button type="submit" disabled={busy} className={SUBMIT_COMPACT}>
                        {mode === "signup" ? "Create account" : "Send reset link"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 sm:hidden">
          <p>&nbsp;</p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginCard />
    </Suspense>
  );
}
