"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import {
  ANNUAL_DISCOUNT,
  PLANS,
  monthlyPriceFor,
  periodCaption,
  type BillingPeriod,
} from "@/lib/pricing";

/**
 * "Simple, Transparent Pricing" — the Monthly/Annual toggle over the
 * three plan cards; Pro carries the violet ring + Most Popular badge.
 * The toggle DEFAULTS TO ANNUAL like the reference (Session 4 audit — the
 * "Annual / Save 20%" pill is active on fresh load; Pro renders $39/mo
 * annual, $49/mo monthly), and the price caption stays "/month" in both
 * states (the live never renders a "billed annually" suffix).
 */
export function Pricing() {
  const [period, setPeriod] = useState<BillingPeriod>("annual");

  return (
    <section id="pricing" className="relative py-16 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16" y={20}>
          <span className="text-xs tracking-widest uppercase text-violet font-body mb-4 block">
            Pricing
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-white/50 max-w-xl mx-auto font-body mb-8">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
          <div className="inline-flex items-center gap-3 p-1 rounded-full border border-white/20 bg-white/[0.03]">
            <button
              onClick={() => setPeriod("monthly")}
              aria-pressed={period === "monthly"}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                period === "monthly"
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod("annual")}
              aria-pressed={period === "annual"}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                period === "annual"
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {/* No whitespace node before the badge — the live's DOM is
                  `Annual<span…>` (161px pill); a JSX newline would add a
                  trailing space to the text run (+4px). */}
              {"Annual"}
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet text-white">
                {`Save ${Math.round(ANNUAL_DISCOUNT * 100)}%`}
              </span>
            </button>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => {
            const price = monthlyPriceFor(plan, period);
            return (
              <Reveal
                key={plan.id}
                delay={i * 120}
                y={30}
                className={
                  plan.popular
                    ? // The live's markup carries `scale-[1.02] md:scale-105`
                      // but its compiled css NEVER EMITS them — its popular
                      // card renders UNSCALED (measured: scale none, card
                      // 540px at every width). Session 5 closed the old D19
                      // +27px delta by matching the RENDERED truth (v4's
                      // scale utilities here would actually scale: 540×1.05
                      // = the exact 567px we used to render).
                      "relative rounded-2xl p-8 transition-all duration-300 border-2 border-violet/40 bg-gradient-to-b from-violet/[0.08] to-transparent shadow-xl shadow-violet/10"
                    : "relative rounded-2xl p-8 transition-all duration-300 border border-white/[0.20] bg-white/[0.02] hover:border-white/10"
                }
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-violet to-electric-blue text-xs font-semibold text-white tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-heading text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-white/50 font-body">{plan.tagline}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-5xl font-bold text-white">
                      {price === null ? "Custom" : `$${price}`}
                    </span>
                    {price !== null && (
                      <span className="text-white/50 text-sm">{periodCaption(period)}</span>
                    )}
                  </div>
                </div>

                <button
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 tracking-wide mb-8 group disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
                      : "border border-white/15 text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="space-y-3">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular ? "bg-violet/20" : "bg-white/5"
                        }`}
                      >
                        <Check className={`w-3 h-3 ${plan.popular ? "text-violet" : "text-white/50"}`} />
                      </div>
                      <span className="text-sm text-white/50 font-body">{f}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
