"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { LogoWordmark } from "./logo";

/**
 * Fixed site navigation — mirrors the reference: transparent over the hero,
 * glass pill center nav on md+, LOG IN text button + white Get Started pill,
 * and a burger dropdown (bg-black/95 backdrop-blur, 44px rows) below md.
 * The pill gains the glass background once the page scrolls past 24px.
 */

export const NAV_LINKS: Array<{ label: string; href: string }> = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "/faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      }`}
      aria-label="Main navigation"
    >
      <div className="px-6 py-4 flex items-center justify-between relative">
        <Link href="/" className="flex items-center" aria-label="NovaAI home">
          <LogoWordmark className="text-white" />
        </Link>

        {/* Center pill nav (md+) */}
        <div className="hidden md:flex items-center gap-1 px-1 py-1 rounded-full backdrop-blur-md absolute left-1/2 -translate-x-1/2 transition-colors duration-300 bg-white/10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-sm transition-colors duration-300 rounded-full tracking-wide font-body text-white/60 hover:text-white hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions (md+) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={goToLogin}
            className="px-5 py-2.5 text-white/80 hover:text-white transition-colors text-sm font-medium tracking-wide bg-transparent border-none cursor-pointer"
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
          className="md:hidden text-white/80 hover:text-white"
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
