"use client";

import { useState } from "react";
import {
  BarChart3,
  Bell,
  Brain,
  CheckCircle2,
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
  },
  {
    id: "analytics",
    label: "Real-time Analytics",
    icon: BarChart3,
    badge: "Instant visibility",
    heading: "Insights the Moment They Matter",
    copy: "Every pipeline emits live metrics — throughput, latency, error budgets — rendered in dashboards that update as work happens.",
    checks: ["Live throughput + latency boards", "Error-budget alerting"],
  },
  {
    id: "builder",
    label: "Workflow Builder",
    icon: Workflow,
    badge: "200+ integrations",
    heading: "Compose Workflows Visually",
    copy: "Drag triggers, transforms, and actions onto a canvas; version every change and promote from draft to production in one click.",
    checks: ["Visual canvas with versioning", "One-click promote to production"],
  },
] as const;

export function Features() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("ai");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section
      id="features"
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
              {tab.checks.map((c) => (
                <div key={c} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-violet" />
                  </div>
                  <span className="text-sm text-gray-700 font-body">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Illustrative card */}
          <div>
            <div className="rounded-2xl border border-gray-300 bg-gray-100 p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet/20 to-violet/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-violet" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-1">
                      {active === "ai" ? "AI Suggestion" : active === "analytics" ? "Live metric" : "Workflow step"}
                    </div>
                    <div className="text-sm text-gray-900">
                      {active === "ai"
                        ? "\u201CMerge steps 3-5 to save 12 min/run\u201D"
                        : active === "analytics"
                          ? "Throughput up 3.2x this week"
                          : "Trigger: new signup → enrich → route"}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-violet/10 text-xs text-violet border border-violet/20">
                    {active === "ai" ? "Apply" : active === "analytics" ? "Live" : "Saved"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(active === "ai"
                    ? ["Pattern Match", "Anomaly Scan", "Auto-Optimize", "Predict"]
                    : active === "analytics"
                      ? ["Throughput", "Latency p95", "Error Budget", "Cost/run"]
                      : ["Triggers", "Transforms", "Actions", "Versioning"]
                  ).map((label) => (
                    <div key={label} className="p-3 rounded-lg bg-white border border-gray-300 text-center">
                      <div className="w-6 h-6 rounded-full bg-violet/10 mx-auto mb-2" />
                      <div className="text-xs text-gray-700">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="h-2 rounded-full bg-gray-300 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet to-electric-blue w-[78%]" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> SOC 2 compliant
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bell className="w-3 h-3" /> Alerts on
                  </span>
                  <span>
                    {active === "analytics" ? "Uptime: 99.99%" : "Optimization score: 78%"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
