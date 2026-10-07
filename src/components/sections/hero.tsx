import { ArrowRight } from "lucide-react";

/**
 * Full-viewport hero — the reference's looping AI video under a left-to-right
 * black gradient, the shimmer-bordered beta badge with pulsing violet dot,
 * the animated `workflows-gradient-text` H1, subtext, and the white
 * "Book a Demo" pill. The scroll indicator sits at the bottom edge.
 */
export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        src="/media/hero-ai-loop.mp4"
      />
      {/* Left-to-right readability gradient (measured). */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
      {/* Bottom fade into the page canvas. */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-black pointer-events-none" />

      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-2">
          <div>
            {/* Beta badge with the traveling border shimmer (SVG stroke). */}
            <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm mb-8 w-fit">
              <svg
                className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
                viewBox="0 0 300 32"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="shimmer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="15%" stopColor="rgba(255,255,255,0.13)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.13)" />
                    <stop offset="85%" stopColor="rgba(255,255,255,0.13)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                  <linearGradient id="shimmer-fade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="12%" stopColor="white" stopOpacity="1" />
                    <stop offset="88%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                  <mask id="shimmer-mask">
                    <rect x="0" y="0" width="300" height="32" fill="url(#shimmer-fade)" />
                  </mask>
                </defs>
                <rect
                  className="border-shimmer-track"
                  x="0.5"
                  y="0.5"
                  width="299"
                  height="31"
                  rx="16"
                  ry="16"
                  fill="none"
                  strokeWidth="1"
                  stroke="url(#shimmer-grad)"
                />
                <g mask="url(#shimmer-mask)">
                  <rect
                    className="border-shimmer-glow-blur"
                    x="0.5"
                    y="0.5"
                    width="299"
                    height="31"
                    rx="16"
                    ry="16"
                    fill="none"
                    stroke="rgba(200,180,255,0.10)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    style={{ filter: "blur(3px)" }}
                  />
                  <rect
                    className="border-shimmer-glow"
                    x="0.5"
                    y="0.5"
                    width="299"
                    height="31"
                    rx="16"
                    ry="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.20)"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
              <div className="w-2 h-2 rounded-full bg-violet animate-pulse" />
              <span className="text-xs text-white/70 tracking-wider font-body uppercase">
                Now in Public Beta — Free for 14 Days
              </span>
            </div>
          </div>
          <h1
            className="font-heading text-[44px] sm:text-[61px] md:text-[66px] lg:text-[79px] font-semibold leading-[1.05] workflows-gradient-text pb-2 sm:pb-4"
            style={{ letterSpacing: "-0.02em", mixBlendMode: "screen", filter: "brightness(1.1)" }}
          >
            Automated Workflows,
            <br />
            Powered by AI
          </h1>
        </div>
        <p className="font-body text-sm sm:text-base text-white/80 mb-6 sm:mb-10 mt-3 sm:mt-4 leading-relaxed max-w-lg font-medium">
          Automate your workflows. Ship faster. <br className="md:hidden" />
          Make fewer mistakes.
        </p>
        <div>
          <a
            href="#pricing"
            className="group inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full text-sm sm:text-base font-semibold hover:bg-white/90 transition-all duration-300 tracking-wide shadow-lg shadow-white/10"
          >
            Book a Demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Scroll indicator (decorative) — the dot travels down the pill like
          the reference (rAF-sampled there: translateY 0→~8px, ≈1.7s). */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-white/40 animate-scroll-dot" />
        </div>
      </div>
    </section>
  );
}
