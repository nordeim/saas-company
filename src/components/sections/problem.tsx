import { ArrowRight, Clock, Shuffle, TriangleAlert } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

/**
 * "THE PROBLEM" — three red-tinted pain cards, a floating gradient
 * chevron, then the violet "One Platform. Zero Manual Work." showcase
 * (left chat card, center mini dashboard, right collaboration card).
 */
export function Problem() {
  return (
    <section className="relative py-16 md:py-28 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16" y={20}>
          <span className="tracking-widest uppercase text-violet font-body mb-4 block text-sm">
            THE PROBLEM
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white tracking-normal mb-4">
            Your Team Deserves Better
          </h2>
          <p className="text-white/50 max-w-xl mx-auto font-body">
            Manual processes are silently draining your team&apos;s potential.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Clock,
              title: "Hours of Manual Work",
              copy: "Teams waste 15+ hours weekly on repetitive tasks that should be automated.",
            },
            {
              icon: Shuffle,
              title: "Scattered Data Silos",
              copy: "Critical insights live in 10 different tools, impossible to consolidate.",
            },
            {
              icon: TriangleAlert,
              title: "Costly Human Errors",
              copy: "Manual handoffs cause mistakes that cost thousands in rework and lost deals.",
            },
          ].map((card, i) => (
            <Reveal
              key={card.title}
              className="p-6 rounded-2xl border border-white/[0.10] bg-white/[0.02] backdrop-blur-sm hover:border-red-500/20 transition-colors group"
              y={30}
              delay={i * 120}
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/15 transition-colors">
                <card.icon className="w-5 h-5 text-red-400/80" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-white/50 font-body leading-relaxed">{card.copy}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="flex justify-center mb-20">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet/20 to-electric-blue/20 border border-white/20 flex items-center justify-center animate-float">
            <ArrowRight className="w-6 h-6 text-violet rotate-90" />
          </div>
        </Reveal>

        {/* The platform showcase */}
        <div className="relative">
          <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            One Platform. Zero Manual Work.
          </h3>
          <Reveal
            className="relative p-8 md:p-12 rounded-3xl border border-violet/40 bg-gradient-to-br from-violet/[0.15] to-electric-blue/[0.10] overflow-hidden"
            y={30}
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet/15 to-transparent pointer-events-none" />
            <div className="relative z-10 grid md:grid-cols-3 gap-8 items-start">
              {/* Left: overview card + orange app icon */}
              <div className="md:col-span-1 space-y-4">
                <Reveal className="p-3 rounded-2xl bg-violet/20 border border-violet/30" y={0}>
                  <p className="text-sm text-white font-body leading-relaxed">
                    A comprehensive overview of your tasks, deadlines, and priorities, all in one
                    place.
                  </p>
                </Reveal>
                <Reveal className="w-12 h-12 rounded-lg bg-orange-500/80 flex items-center justify-center" y={0}>
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                      d="M15.2891 2.66058C18.7885 -0.886861 24.4554 -0.886861 27.955 2.66058C31.4545 6.20803 31.4545 11.9526 27.955 15.5L15.2891 2.66058Z"
                      fill="white"
                    />
                    <path
                      d="M27.955 15.5C31.4545 19.0474 31.4545 24.7919 27.955 28.3395C24.4554 31.8868 18.7885 31.8868 15.2891 28.3395L27.955 15.5Z"
                      fill="white"
                    />
                    <path
                      d="M15.2905 28.3395C11.791 31.8868 6.12413 31.8868 2.62463 28.3395C-0.874876 24.7919 -0.874876 19.0474 2.62463 15.5L15.2905 28.3395Z"
                      fill="white"
                    />
                    <path
                      d="M2.62463 15.5C-0.874876 11.9526 -0.874876 6.20803 2.62463 2.66058C6.12413 -0.886861 11.791 -0.886861 15.2905 2.66058L2.62463 15.5Z"
                      fill="white"
                    />
                  </svg>
                </Reveal>
              </div>

              {/* Center: mini dashboard in a browser frame — links to the
                  live app's dashboard route (its /checkout target 404s on
                  the reference; the clone serves a REAL workspace). */}
              <Reveal className="md:col-span-1" y={0}>
                <a
                  className="relative mx-auto max-w-xs rounded-2xl border border-violet/30 bg-white/[0.08] backdrop-blur-sm p-2 shadow-2xl shadow-violet/20 block hover:shadow-violet/40 transition-shadow duration-300"
                  href="/dashboard"
                >
                  <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
                  <div className="rounded-xl bg-gradient-to-br from-black via-black/90 to-black/85 overflow-hidden">
                    <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="ml-2 text-xs text-white/40 font-body">Dashboard</span>
                    </div>
                    <div className="p-4 min-h-[200px] space-y-3">
                      <div className="space-y-2">
                        <div className="h-4 rounded bg-white/20 w-3/4" />
                        <div className="h-3 rounded bg-violet/30 w-1/2" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="h-12 rounded-lg bg-white/[0.15] border border-white/25" />
                        ))}
                      </div>
                      <div className="h-20 rounded-lg bg-white/[0.12] border border-white/25" />
                    </div>
                  </div>
                </a>
              </Reveal>

              {/* Right: collaboration card + avatar stack */}
              <div className="md:col-span-1 space-y-4">
                <Reveal className="p-5 rounded-2xl bg-electric-blue/20 border border-electric-blue/30" y={0}>
                  <p className="text-sm text-white font-body leading-relaxed">
                    Real-time collaboration and instant team communication in one seamless
                    interface.
                  </p>
                </Reveal>
                <Reveal className="flex gap-2" y={0}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-violet/40 to-electric-blue/40 border border-white/10"
                    />
                  ))}
                </Reveal>
              </div>
            </div>

            <Reveal className="mt-8 pt-8 border-t border-white/10" y={20}>
              <p className="font-body leading-relaxed text-center max-w-lg mx-auto text-white/50">
                NovaAI connects all your data sources, automates repetitive workflows, and
                delivers real-time insights — cutting 15+ hours of manual work every week while
                eliminating costly errors across your entire pipeline.
              </p>
            </Reveal>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
