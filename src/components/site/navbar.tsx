"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { LogoWordmark } from "./logo";

/**
 * Fixed site navigation — mirrors the reference (Session 4 scroll audit):
 * transparent over the hero, glass pill center nav on md+, LOG IN text
 * button + white Get Started pill, and a burger dropdown (bg-black/95
 * backdrop-blur, 44px rows) below md.
 *
 * Section-aware chrome, measured on the live across scrollY 0→6000:
 * - The nav NEVER gains a background (bg-transparent at every depth — the
 *   old scrolled-glass bar was an invention).
 * - Scroll-spy: the link of the current section gets a pill (bg-white/30
 *   dark / bg-black/15 light) + solid text — the last section whose top
 *   passed the ~2/3 viewport line (sections without a link keep the
 *   previous highlight).
 * - Light mode while the nav band (top 72px) overlaps a
 *   [data-nav-theme="light"] section (the white features section): logo,
 *   links, Log In and the pill swap to black variants.
 */

export const NAV_LINKS: Array<{ label: string; href: string }> = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "/faq" },
];

const SPY_SECTION_IDS = ["features", "how-it-works", "pricing", "testimonials"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [light, setLight] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      // Scroll-spy: last section whose top passed the ~2/3 viewport line.
      const line = y + window.innerHeight * (2 / 3);
      let current: string | null = null;
      for (const id of SPY_SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + y <= line) current = id;
      }
      setActiveId(current);
      // Light mode while the nav band overlaps a light-themed section.
      let isLight = false;
      for (const el of document.querySelectorAll<HTMLElement>("[data-nav-theme='light']")) {
        const r = el.getBoundingClientRect();
        if (r.top < 72 && r.bottom > 0) isLight = true;
      }
      setLight(isLight);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Close the mobile menu on Escape and lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const goToLogin = useCallback(() => {
    setOpen(false);
    router.push("/login");
  }, [router]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent"
      aria-label="Main navigation"
    >
      <div className="px-6 py-4 flex items-center justify-between relative">
        <Link
          href="/"
          className={`flex items-center transition-colors duration-300 ${light ? "text-black" : "text-white"}`}
          aria-label="NovaAI home"
        >
          <LogoWordmark className="text-current" />
        </Link>

        {/* Center pill nav (md+) — bg-white/10 dark / bg-black/10 light */}
        <div
          className={`hidden md:flex items-center gap-1 px-1 py-1 rounded-full backdrop-blur-md absolute left-1/2 -translate-x-1/2 transition-colors duration-300 ${
            light ? "bg-black/10" : "bg-white/10"
          }`}
        >
          {NAV_LINKS.map((link) => {
            const active = link.href === `#${activeId}`;
            const base =
              "px-4 py-2 text-sm transition-colors duration-300 rounded-full tracking-wide font-body";
            const tone = light
              ? active
                ? "text-black bg-black/15"
                : "text-black/60 hover:text-black hover:bg-black/5"
              : active
                ? "text-white bg-white/30"
                : "text-white/60 hover:text-white hover:bg-white/5";
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`${base} ${tone}`}
                aria-current={active ? "true" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right actions (md+) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={goToLogin}
            className={`px-5 py-2.5 transition-colors text-sm font-medium tracking-wide bg-transparent border-none cursor-pointer ${
              light ? "text-black/80 hover:text-black" : "text-white/80 hover:text-white"
            }`}
          >
            Log In
          </button>
          <Link
            href="#pricing"
            className="group relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full tracking-wide overflow-hidden bg-white text-black transition-colors duration-300 hover:text-white"
          >
            <span
              className="get-started-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"
              aria-hidden="true"
            />
            <span className="relative z-10 text-black group-hover:text-black">Get Started</span>
            <ArrowRight className="relative z-10 w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Burger (below md) */}
        <button
          className={`md:hidden transition-colors ${light ? "text-black/80 hover:text-black" : "text-white/80 hover:text-white"}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown — measured from the reference: black/95 + blur,
          hairline bottom border, 44px rows, Get Started pill footer row. */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/5"
        >
          <div className="px-6 py-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-white/70 hover:text-white transition-colors text-sm tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={goToLogin}
              className="px-4 py-3 text-white/70 hover:text-white transition-colors text-sm tracking-wide bg-transparent border-none cursor-pointer w-full text-left"
            >
              Log In
            </button>
            <Link
              href="#pricing"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 px-5 py-3 bg-white text-black rounded-full text-sm font-medium tracking-wide"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
