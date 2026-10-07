import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/site/reveal";

/**
 * "Stop Managing. Start Automating." — the closing CTA with the animated
 * gradient accent on the second line.
 */
export function CtaSection() {
  return (
    <section className="relative py-16 md:py-28 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* The live animates ONLY the badge (y=30 / 800ms) — the H2, the
            copy and the buttons render statically (Session 8 F1-EXTRA). */}
        <Reveal y={30} duration={800}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet/20 bg-violet/5 mb-8">
            <div className="w-2 h-2 rounded-full bg-violet animate-pulse" />
            <span className="text-xs text-violet tracking-wider font-body uppercase">
              Ready to Transform Your Workflow?
            </span>
          </div>
        </Reveal>
        <h2
          className="font-heading text-4xl md:text-6xl font-bold text-white tracking-normal mb-6 leading-tight"
          /* The --tw-leading pin reproduces the reference's v3 cascade
             (md:text-6xl's 60px line-height beats the coexisting
             leading-tight — v4 inverts it; Session 8 F4). */
          style={{ "--tw-leading": "initial" } as CSSProperties}
        >
          Stop Managing. <br />
          <span className="animated-gradient-text">Start Automating.</span>
        </h2>
          <p className="text-base text-white/50 font-body max-w-xl mx-auto mb-10">
            Your competitors are already automating. Save 15+ hours weekly. Start free now—no
            credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="#pricing"
              className="group flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full text-base font-semibold hover:bg-white/90 transition-all duration-300 tracking-wide shadow-lg shadow-white/10"
            >
              Try NovaAI for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
      </div>
    </section>
  );
}
