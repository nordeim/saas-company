"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { LogoWordmark } from "./logo";

/**
 * Site footer — mirrors the reference layout (brand column + Product/Legal/
 * Social/Subscribe columns, hairline-top copyright line). SUPERSET: the
 * subscribe form persists to POST /api/newsletter instead of doing nothing.
 */
export function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload?.ok) {
        setState("done");
        setMessage("You're on the list.");
        setEmail("");
      } else {
        setState("error");
        setMessage(payload?.error?.message ?? "Something went wrong. Try again.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <footer className="py-10 md:pb-20">
      <div className="px-6 flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-32 mb-12 flex-1">
          <div className="flex flex-col flex-shrink-0 md:w-[280px]">
            <div className="mb-3">
              <LogoWordmark className="text-white" petals="flogo" fill="white" />
            </div>
            <p className="text-sm text-white/50 font-body">
              Automate your workflows with intelligent AI.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-auto gap-y-8 md:gap-x-auto">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white/80 tracking-wide uppercase font-body">
                Product
              </h3>
              <div className="flex flex-col gap-3 text-sm text-white/50 font-body">
                <a href="#features" className="hover:text-white/80 transition-colors">
                  Features
                </a>
                <a href="#pricing" className="hover:text-white/80 transition-colors">
                  Pricing
                </a>
                <Link href="/faq" className="hover:text-white/80 transition-colors">
                  FAQ
                </Link>
                <a href="#" className="hover:text-white/80 transition-colors">
                  Docs
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white/80 tracking-wide uppercase font-body">
                Legal
              </h3>
              <div className="flex flex-col gap-3 text-sm text-white/50 font-body">
                <Link href="/privacy" className="hover:text-white/80 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-white/80 transition-colors">
                  Terms
                </Link>
                <Link href="/accessibility" className="hover:text-white/80 transition-colors">
                  Accessibility
                </Link>
                <Link href="/refund-policy" className="hover:text-white/80 transition-colors">
                  Refund Policy
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white/80 tracking-wide uppercase font-body">
                Social
              </h3>
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors font-body">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors font-body">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors font-body">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors font-body">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white/80 tracking-wide uppercase font-body">
                Subscribe
              </h3>
              <div className="flex flex-col gap-3">
                <p className="text-xs text-white/50 font-body">
                  Get the latest updates delivered to your inbox.
                </p>
                <form className="flex flex-col gap-2" onSubmit={onSubscribe}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    required
                    aria-label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors font-body"
                  />
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="px-2 py-1.5 bg-white/20 hover:bg-white/30 border border-white/20 rounded text-white/80 hover:text-white transition-colors font-body font-light disabled:opacity-50"
                    aria-label="Subscribe"
                  >
                    <Mail className="w-3 h-3 mx-auto" />
                  </button>
                </form>
                {message && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`text-xs font-body ${state === "error" ? "text-red-400" : "text-green-400"}`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/50 font-body text-left mt-auto pt-8 border-t border-white/10">
          © {new Date().getFullYear()} NovaaAI. Built on Base44.
        </p>
      </div>
    </footer>
  );
}
