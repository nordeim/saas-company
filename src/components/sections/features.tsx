"use client";

import { useState } from "react";
import {
  BarChart3,
  Brain,
  ChartColumn,
  Clock,
  Shield,
  Workflow,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";

/**
 * "Everything You Need to Scale" — the WHITE section with the three-tab
 * pill (AI Intelligence / Real-time Analytics / Workflow Builder) and a
 * split layout: copy + checklist left, an illustrative card right.
 */
const TABS = [
  {
    id: "ai",
    label: "AI Intelligence",
    icon: Brain,
    badge: "Saves 4 hours/week",
    heading: "Smart Automation That Learns",
    copy: "Our models observe your patterns and proactively suggest optimizations — saving your team 4+ hours every week on recurring tasks.",
    checks: ["Self-optimizing pipelines", "Anomaly detection built-in"],
    checkIcons: [Zap, Shield],
  },
  {
    id: "analytics",
    label: "Real-time Analytics",
    icon: BarChart3,
    badge: "Instant visibility",
    heading: "Insights the Moment They Matter",
    copy: "Every pipeline emits live metrics — throughput, latency, error budgets — rendered in dashboards that update as work happens.",
    checks: ["Live throughput + latency boards", "Error-budget alerting"],
    checkIcons: [ChartColumn, Clock],
  },
  {
    id: "builder",
    label: "Workflow Builder",
    icon: Workflow,
    badge: "200+ integrations",
    heading: "Compose Workflows Visually",
    copy: "Drag triggers, transforms, and actions onto a canvas; version every change and promote from draft to production in one click.",
    checks: ["Visual canvas with versioning", "One-click promote to production"],
    checkIcons: [Workflow, Zap],
  },
] as const;

/* The analytics tab's 12-bar chart, measured from the reference DOM: heights
   are the final animated values; each bar carries its own violet gradient. */
const ANALYTICS_BARS = [
  { i: 0, height: "30%", bottom: "rgb(116, 37, 244)", top: "rgb(37, 89, 244)" },
  { i: 1, height: "45%", bottom: "rgb(119, 42, 244)", top: "rgb(42, 92, 244)" },
  { i: 2, height: "35%", bottom: "rgb(122, 47, 244)", top: "rgb(47, 96, 244)" },
  { i: 3, height: "60%", bottom: "rgb(125, 52, 244)", top: "rgb(52, 100, 244)" },
  { i: 4, height: "55%", bottom: "rgb(128, 56, 245)", top: "rgb(56, 103, 245)" },
  { i: 5, height: "70%", bottom: "rgb(132, 61, 245)", top: "rgb(61, 107, 245)" },
  { i: 6, height: "50%", bottom: "rgb(135, 66, 245)", top: "rgb(66, 111, 245)" },
  { i: 7, height: "80%", bottom: "rgb(138, 71, 245)", top: "rgb(71, 114, 245)" },
  { i: 8, height: "65%", bottom: "rgb(141, 76, 246)", top: "rgb(76, 118, 246)" },
  { i: 9, height: "90%", bottom: "rgb(144, 81, 246)", top: "rgb(81, 122, 246)" },
  { i: 10, height: "75%", bottom: "rgb(147, 85, 246)", top: "rgb(85, 126, 246)" },
  { i: 11, height: "95%", bottom: "rgb(150, 90, 246)", top: "rgb(90, 129, 246)" },
] as const;

export function Features() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("ai");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section
      id="features"
      data-nav-theme="light"
      className="relative py-16 md:py-28 bg-gradient-to-b from-white via-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16" y={20}>
          <span className="text-xs tracking-widest uppercase text-violet font-body mb-4 block">
            Features
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Everything You Need <br className="md:hidden" />
            to Scale
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto font-body">
            Three powerful toolsets, one seamless experience.
          </p>
        </Reveal>

        {/* Tab pill */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 rounded-full border border-gray-300 bg-gray-100 backdrop-blur-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                aria-pressed={active === t.id}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 tracking-wide ${
                  active === t.id
                    ? "bg-white text-black shadow-lg border border-gray-200"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Split layout */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/10 border border-violet/30 mb-6">
              <Zap className="w-3 h-3 text-violet" />
              <span className="text-xs text-violet font-medium tracking-wider">{tab.badge}</span>
            </div>
            <h3 className="font-heading text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {tab.heading}
            </h3>
            <p className="text-gray-700 font-body leading-relaxed mb-8">{tab.copy}</p>
            <div className="flex flex-col gap-3">
              {tab.checks.map((c, i) => {
                const Icon = tab.checkIcons[i] ?? Zap;
                return (
                  <div key={c} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-violet" />
                    </div>
                    <span className="text-sm text-gray-700 font-body">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Illustrative card — per-tab content measured from the reference
              DOM (2026-10-07 survey): AI tab = suggestion row + chip grid +
              progress bar + right-aligned caption; Analytics tab = 12-bar
              chart + three stat chips; Builder tab = numbered steps + the
              pulsing Pipeline Active footer. */}
          <div>
            <div className="rounded-2xl border border-gray-300 bg-gray-100 p-6 backdrop-blur-sm">
              {active === "ai" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-300">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet/20 to-violet/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-violet" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-1">AI Suggestion</div>
                      <div className="text-sm text-gray-900">
                        {`"Merge steps 3-5 to save 12 min/run"`}
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-violet/10 text-xs text-violet border border-violet/20">
                      Apply
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["Pattern Match", "Anomaly Scan", "Auto-Optimize", "Predict"].map((label) => (
                      <div key={label} className="p-3 rounded-lg bg-white border border-gray-300 text-center">
                        <div className="w-6 h-6 rounded-full bg-violet/10 mx-auto mb-2" />
                        <div className="text-xs text-gray-700">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-2 rounded-full bg-gray-300 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet to-electric-blue w-[78%]" />
                  </div>
                  <div className="text-xs text-gray-600 text-right">Optimization score: 78%</div>
                </div>
              )}

              {active === "analytics" && (
                <div className="space-y-4">
                  <div className="flex items-end gap-1 h-32">
                    {ANALYTICS_BARS.map((bar) => (
                      <div
                        key={bar.i}
                        className="flex-1 rounded-t-sm"
                        style={{
                          background: `linear-gradient(to top, ${bar.bottom}, ${bar.top})`,
                          height: bar.height,
                        }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["2,847", "Active Users"],
                      ["12.4%", "Conversion"],
                      ["$84.2K", "Revenue"],
                    ].map(([value, label]) => (
                      <div key={label} className="p-3 rounded-lg bg-white border border-gray-300 text-center">
                        <div className="text-lg font-heading font-bold text-gray-900">{value}</div>
                        <div className="text-xs text-gray-600 mt-1">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {active === "builder" && (
                <div className="space-y-3">
                  {["Connect CRM", "Filter Leads", "Enrich Data", "Send to Slack"].map((step, i) => (
                    <div key={step} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet/20 to-violet/10 flex items-center justify-center text-xs font-bold text-gray-700">
                        {i + 1}
                      </div>
                      <div className="flex-1 text-sm text-gray-800">{step}</div>
                      {i < 3 && <div className="w-6 h-0.5 bg-gray-300 rounded" />}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-600">Pipeline Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
