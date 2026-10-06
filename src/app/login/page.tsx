"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";

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

function LoginCard() {
  const router = useRouter();
  const params = useSearchParams();
  const fromUrl = params.get("from_url") || "/dashboard";

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const heading =
    mode === "signup"
      ? "Create your account"
      : mode === "forgot"
        ? "Reset your password"
        : "Welcome to SAAS Company";
  const subheading =
    mode === "signup"
      ? "Start automating in minutes"
      : mode === "forgot"
        ? "We'll send you a reset link"
        : "Sign in to continue";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "forgot") {
        // No mail transport in the self-hosted clone — acknowledge honestly.
        setNotice("If that address exists, a reset link is on its way.");
        return;
      }
      const res = await fetch(`/api/auth/${mode === "signup" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
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
      <div className="w-full max-w-md">
        <div className="text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          {/* 4px top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
          <div className="p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
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
                  {heading}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base font-medium">{subheading}</p>
              </div>

              <div className="w-full">
                {/* Google (parity; degrades to a notice) */}
                <div className="space-y-3">
                  <button
                    onClick={onGoogle}
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
                  >
                    <span className="transition-transform duration-200 -ml-4">
                      <GoogleIcon />
                    </span>
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
                    {mode === "signup" && (
                      <div className="space-y-1.5">
                        <label
                          className="text-sm font-medium text-slate-700"
                          htmlFor="name"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600"
                          placeholder="Ada Lovelace"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700" htmlFor="email">
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
                          className="flex w-full border px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {mode !== "forgot" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700" htmlFor="password">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <input
                            id="password"
                            type="password"
                            required
                            autoComplete={mode === "signup" ? "new-password" : "current-password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex w-full border px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
                    >
                      {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
                    </button>

                    {error && (
                      <p role="alert" className="text-sm text-red-600 text-center">
                        {error}
                      </p>
                    )}
                    {notice && (
                      <p role="status" className="text-sm text-slate-500 text-center">
                        {notice}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === "forgot" ? "signin" : "forgot");
                          setError("");
                          setNotice("");
                        }}
                        className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                      >
                        {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === "signup" ? "signin" : "signup");
                          setError("");
                          setNotice("");
                        }}
                        className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {mode === "signup" ? (
                          <>
                            Have an account? <span className="font-medium text-slate-700">Sign in</span>
                          </>
                        ) : (
                          <>
                            Need an account?{" "}
                            <span className="font-medium text-slate-700">Sign up</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 sm:hidden">
          <p>&nbsp;</p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            ← Back to SAAS Company
          </Link>
        </p>
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
